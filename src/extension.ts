import * as vscode from "vscode";
import { SpotifyPlayerViewProvider } from "./panel";
import axios from "axios";
import { generateRandomString, sha256, base64encode } from "./utils/auth";
import express, { Request, Response } from "express";

const clientId = process.env.CLIENT_ID;
const redirectUri = "http://localhost:3000/callback";
let extensionContext: vscode.ExtensionContext;
let provider: SpotifyPlayerViewProvider;
const closeTab = `<!DOCTYPE html><html><head><title>Close Tab</title></head><body><script type="text/javascript">window.close();</script></body></html>`;

export function activate(context: vscode.ExtensionContext) {
    extensionContext = context;

    provider = new SpotifyPlayerViewProvider(context.extensionUri);

    context.subscriptions.push(vscode.window.registerWebviewViewProvider(SpotifyPlayerViewProvider.viewType, provider));
}

const handleError = (error: any) => {
    if (axios.isAxiosError(error)) {
        console.error(`${error.response?.status}: ${error.message}`);
    } else {
        console.error("Unknown error");
    }
};

const getAccessToken = async () => {
    const expirationTime = extensionContext.globalState.get<number>("token_expiration_time");

    if (expirationTime && Date.now() > expirationTime) {
        try {
            await refreshAccessToken();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return extensionContext.globalState.get("access_token");
};

const getToken = async (code: string, codeVerifier: string) => {
    const payload = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });

    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    };

    return await axios.post("https://accounts.spotify.com/api/token", payload, config);
};

const refreshAccessToken = async () => {
    const refreshToken = extensionContext.globalState.get("refresh_token");

    const config = {
        params: {
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: clientId,
        },
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    };

    const res = await axios.post("https://accounts.spotify.com/api/token", {}, config);

    extensionContext.globalState.update("access_token", res.data.access_token);
    extensionContext.globalState.update("token_expiration_time", Date.now() + res.data.expires_in * 1000);

    // Only update refresh token if a new one if provided, else continue with the old one
    if (res.data.refresh_token) {
        extensionContext.globalState.update("refresh_token", res.data.refresh_token);
    }
};

export const updateLoginState = async () => {
    if (await getAccessToken()) {
        await new Promise((resolve) => setTimeout(resolve, 100)); // wait 100ms
        provider.view.webview.postMessage({
            command: "loginResponse",
            response: true,
        });
        await updatePlayer();
    } else {
        await new Promise((resolve) => setTimeout(resolve, 100)); // wait 100ms
        provider.view.webview.postMessage({
            command: "loginResponse",
            response: false,
        });
    }
};

export const handleLogin = async () => {
    const codeVerifier = generateRandomString(64);
    extensionContext.globalState.update("code_verifier", codeVerifier);
    const hashed = sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    const scope = "user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state";
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    const params = {
        response_type: "code",
        client_id: clientId,
        scope: scope,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    };

    authUrl.search = new URLSearchParams(params).toString();
    await vscode.env.openExternal(vscode.Uri.parse(authUrl.toString()));

    const app = express();
    app.get("/callback", async (req: Request, res: Response) => {
        const error = req.query.error;
        if (error) {
            res.status(409).send(error);
        }

        const storedCodeVerifier = extensionContext.globalState.get<string>("code_verifier");
        const tokenData = await getToken(req.query.code as string, storedCodeVerifier);

        extensionContext.globalState.update("access_token", tokenData.data.access_token);
        extensionContext.globalState.update("refresh_token", tokenData.data.refresh_token);
        extensionContext.globalState.update("token_expiration_time", Date.now() + tokenData.data.expires_in * 1000);

        res.status(200).send(closeTab);

        // Once authenticated, the server can close
        server.close();

        if (tokenData.status === 200) {
            provider.view.webview.postMessage({
                command: "loginResponse",
                response: true,
            });

            // Setup player state
            await updatePlayer();
        } else {
            provider.view.webview.postMessage({
                command: "loginResponse",
                response: false,
            });
        }
    });
    const server = app.listen(3000);
};

export const handleLogout = () => {
    extensionContext.globalState.update("access_token", null);
    extensionContext.globalState.update("refresh_token", null);
    extensionContext.globalState.update("token_expiration_time", null);
    extensionContext.globalState.update("code_verifier", null);
};

export const updatePlayer = async () => {
    const accessToken = await getAccessToken();
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    };

    try {
        const res = await axios.get("https://api.spotify.com/v1/me/player", config);

        provider.view.webview.postMessage({ command: "time", timeInfo: res.data });
        provider.view.webview.postMessage({ command: "currentSong", currentSongInfo: res.data.item });
    } catch (error) {
        handleError(error);
    }
};

export const handlePlay = async () => {
    const accessToken = await getAccessToken();
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    };

    try {
        await axios.put("https://api.spotify.com/v1/me/player/play", {}, config);

        await updatePlayer();
    } catch (error) {
        handleError(error);
    }
};

export const handlePause = async () => {
    const accessToken = await getAccessToken();
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    };

    try {
        await axios.put("https://api.spotify.com/v1/me/player/pause", {}, config);
    } catch (error) {
        handleError(error);
    }
};

export const handlePrevious = async () => {
    const accessToken = await getAccessToken();
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    };

    try {
        await axios.post("https://api.spotify.com/v1/me/player/previous", {}, config);
    } catch (error) {
        handleError(error);
    }

    await updatePlayer();
};

export const handleNext = async () => {
    const accessToken = await getAccessToken();
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    };

    try {
        await axios.post("https://api.spotify.com/v1/me/player/next", {}, config);
    } catch (error) {
        handleError(error);
    }

    await updatePlayer();
};

export const handleSeek = async (newProgress: number) => {
    const accessToken = await getAccessToken();
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
        params: {
            position_ms: newProgress,
        },
    };

    try {
        await axios.put("https://api.spotify.com/v1/me/player/seek", {}, config);
    } catch (error) {
        handleError(error);
    }

    await updatePlayer();
};
