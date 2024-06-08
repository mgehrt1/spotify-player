import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    const provider = createSpotifyPlayerViewProvider(context.extensionUri);

    context.subscriptions.push(vscode.window.registerWebviewViewProvider(provider.viewType, provider));
}

const createSpotifyPlayerViewProvider = (extensionUri: vscode.Uri): vscode.WebviewViewProvider & { viewType: string; extensionUri: vscode.Uri; view?: vscode.WebviewView } => {
    const provider = {
        viewType: "spotify-player",
        extensionUri,
        view: undefined as vscode.WebviewView | undefined,
        resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
            provider.view = webviewView;

            webviewView.webview.options = {
                // Allow scripts in the webview
                enableScripts: true,

                localResourceRoots: [provider.extensionUri],
            };

            webviewView.webview.html = getHtmlForWebview(webviewView.webview, provider.extensionUri);
        },
    };

    return provider;
};

const getHtmlForWebview = (webview: vscode.Webview, extensionUri: vscode.Uri) => {
    // local path
    const scriptPath = vscode.Uri.joinPath(extensionUri, "media", "main.js");
    const stylesPath = vscode.Uri.joinPath(extensionUri, "media", "main.css");

    // to load into webview
    const scriptUri = webview.asWebviewUri(scriptPath);
    const stylesUri = webview.asWebviewUri(stylesPath);

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <link href="${stylesUri}" rel="stylesheet"/>
            <script src="${scriptUri}"></script>

            <title>Spotify Player</title>
        </head>
        <body>
            <div id="main">
                <h1>Hello Matthew</h1>
                <div class="controller-container">
                    <button class="previous-button">Previous</button>
                    <button class="play-button">Play</button>
                    <button class="next-button">Next</button>
                </div>
            </div>
        </body>
        </html>`;
};
