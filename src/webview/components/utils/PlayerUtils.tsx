interface vscode {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
}
declare const vscode: vscode;

export const updatePlayerState = () => {
    vscode.postMessage({
        command: "updatePlayer",
    });
};
