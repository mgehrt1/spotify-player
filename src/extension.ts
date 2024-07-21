import * as vscode from "vscode";
import { SpotifyPlayerViewProvider } from "./panel";
import axios from "axios";
import { generateRandomString, sha256, base64encode, getToken } from "./auth/auth";
import express from "express";

const clientId = process.env.CLIENT_ID;
const redirectUri = "http://localhost:3000/callback";
let myExtensionContext: vscode.ExtensionContext;
let memento: vscode.Memento;
let provider: SpotifyPlayerViewProvider;
const closeTab = `<!DOCTYPE html><html><head><title>Close Tab</title></head><body><script type="text/javascript">window.close();</script></body></html>`;

export function activate(context: vscode.ExtensionContext) {
    myExtensionContext = context;
    memento = myExtensionContext.globalState;

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

export const handleLogin = async () => {
    const codeVerifier = generateRandomString(64);
    const hashed = sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    const scope = "user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state";
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    memento.update("code_verifier", codeVerifier);

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
    app.get("/callback", async (req: any, res: any) => {
        const error = req.query.error;
        if (error) {
            res.status(409).send(error);
        }

        const code = req.query.code as string;
        const success = await getToken(code, clientId || "", redirectUri, provider, memento);

        res.status(200).send(closeTab);

        // Once authenticated, the server can close
        server.close();

        if (success) {
            provider.view.webview.postMessage({
                command: "loginResponse",
                response: "success",
            });

            // Setup player state
            await getQueue();
        } else {
            provider.view.webview.postMessage({
                command: "loginResponse",
                response: "fail",
            });
        }
    });
    const server = app.listen(3000, () => console.log("Listening on port 3000!"));
};

const getQueue = async () => {
    const accessToken = memento.get("access_token");
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    };

    try {
        const res = await axios.get("https://api.spotify.com/v1/me/player/queue", config);

        provider.view.webview.postMessage({ command: "queue", queueInfo: res.data.queue });
        provider.view.webview.postMessage({ command: "currentSong", currentSongInfo: res.data.currently_playing });
    } catch (error) {
        handleError(error);
    }
};

export const handlePlay = async () => {
    const accessToken = memento.get("access_token");
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    };

    try {
        await axios.put("https://api.spotify.com/v1/me/player/play", {}, config);
    } catch (error) {
        handleError(error);
    }
};

export const handlePause = async () => {
    const accessToken = memento.get("access_token");
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
    const accessToken = memento.get("access_token");
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
};

export const handleNext = async () => {
    const accessToken = memento.get("access_token");
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
};
