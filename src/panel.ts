import * as vscode from "vscode";
import getNonce from "./nonce";
import { handleLogin, handleNext, handlePause, handlePlay, handlePrevious } from "./extension";

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

    // public isLoggedIn() {
    //     const access_token = this.memento.get("access_token");
    //     if (this.view && access_token) {
    //         this.view.webview.postMessage({ command: "login" });
    //     }
    // }

    private getWebviewContent(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "out", "main.wv.js"));
        // const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "out", "main.css"));
        // <link href="${styleUri}" rel="stylesheet">

        const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src https://i.scdn.co http://www.w3.org;">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Spotify Player</title>
                </head>
                <body>
                    <div id="root"></div>
                    <script nonce="${nonce}">
                        const vscode = acquireVsCodeApi();
                    </script>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
			</html>`;
    }
}
