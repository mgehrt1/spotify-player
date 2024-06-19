import * as vscode from "vscode";
import express from "express";
import axios from "axios";
import { generateRandomString, sha256, base64encode, getToken } from "./auth";

const clientId = process.env.CLIENT_ID;
const redirectUri = "http://localhost:3000/callback";
let myExtensionContext: vscode.ExtensionContext;
let memento: vscode.Memento;
let provider: SpotifyPlayerViewProvider;

export function activate(context: vscode.ExtensionContext) {
    myExtensionContext = context;
    memento = myExtensionContext.globalState;

    provider = new SpotifyPlayerViewProvider(context.extensionUri);

    context.subscriptions.push(vscode.window.registerWebviewViewProvider(SpotifyPlayerViewProvider.viewType, provider));
}

export class SpotifyPlayerViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "spotify-player";

    public view?: vscode.WebviewView;

    constructor(private readonly extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };

        webviewView.webview.html = this.getWebviewContent(webviewView.webview);
        // provider.isLoggedIn(); TODO: add back once we figure out how to revalidate every hour

        webviewView.webview.onDidReceiveMessage(
            (message) => {
                switch (message.command) {
                    case "login":
                        handleLogin();
                        break;
                    case "play":
                        handlePlay();
                        break;
                    case "pause":
                        handlePause();
                        break;
                    case "previous":
                        handlePrevious();
                        break;
                    case "next":
                        handleNext();
                        break;
                    default:
                        break;
                }
            },
            undefined,
            undefined
        );
    }

    public isLoggedIn() {
        const access_token = memento.get("access_token");
        if (this.view && access_token) {
            this.view.webview.postMessage({ command: "login" });
        }
    }

    private getWebviewContent(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", "main.js"));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", "main.css"));

        const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src https://i.scdn.co;">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">

                    <link href="${styleUri}" rel="stylesheet">

                    <title>Spotify Player</title>
                </head>
                <body id="test">
                    <div class="controller-container">
                        <button class="previous-button">Previous</button>
                        <button class="play-button">Play</button>
                        <button class="pause-button">Pause</button>
                        <button class="next-button">Next</button>
                    </div>
                    <button class="login-button">Login</button>

                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
			</html>`;
    }
}

const getNonce = () => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const handleError = (error: any) => {
    if (axios.isAxiosError(error)) {
        console.error(`${error.response?.status}: ${error.message}`);
    } else {
        console.error("Unknown error");
    }
};

const handleLogin = async () => {
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
    app.get("/callback", async (req, res) => {
        const error = req.query.error;
        if (error) {
            res.status(409).send(error);
        }

        const code = req.query.code as string;
        getToken(code, clientId || "", redirectUri, provider, memento);

        res.status(200).send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Close Tab</title>
              </head>
              <body>
                <script type="text/javascript">
                  window.close();
                </script>
              </body>
            </html>
          `);

        // Once authenticated, the server can close
        server.close();

        // Setup player state
        getQueue();
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
        console.log(res.data);

        provider.view?.webview.postMessage({ command: "currently_playing", queue_info: res.data });
    } catch (error) {
        handleError(error);
    }
};

const handlePlay = async () => {
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

const handlePause = async () => {
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

const handlePrevious = async () => {
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

const handleNext = async () => {
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
