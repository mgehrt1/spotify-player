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

    // const access_token = getAccessToken();

    // if (!access_token) {

    // }

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

const getAccessToken = () => {
    return extensionContext?.globalState.get("access_token");
};

const getToken = async (code: string, codeVerifier: string) => {
    const payload = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
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

export const handleLogin = async () => {
    const codeVerifier = generateRandomString(64);
    const hashed = sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    const scope = "user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state";
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    const params = {
        response_type: "code",
        client_id: clientId || "",
        scope,
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

        const tokenData = await getToken(req.query.code as string, codeVerifier);

        extensionContext.globalState.update("access_token", tokenData.data.access_token);
        extensionContext.globalState.update("refresh_token", tokenData.data.refresh_token);

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
};

export const updatePlayer = async () => {
    const accessToken = getAccessToken();
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    };

    try {
        const playerRes = await axios.get("https://api.spotify.com/v1/me/player", config);
        const queueRes = await axios.get("https://api.spotify.com/v1/me/player/queue", config);

        provider.view.webview.postMessage({ command: "time", timeInfo: playerRes.data });
        provider.view.webview.postMessage({ command: "queue", queueInfo: queueRes.data.queue });
        provider.view.webview.postMessage({ command: "currentSong", currentSongInfo: queueRes.data.currently_playing });
    } catch (error) {
        handleError(error);
    }
};

export const handlePlay = async () => {
    const accessToken = getAccessToken();
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    };

    try {
        await axios.put("https://api.spotify.com/v1/me/player/play", {}, config);

        updatePlayer();
    } catch (error) {
        handleError(error);
    }
};

export const handlePause = async () => {
    const accessToken = getAccessToken();
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
    const accessToken = getAccessToken();
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
    const accessToken = getAccessToken();
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
