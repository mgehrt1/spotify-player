const vscode = acquireVsCodeApi();

const handlePlayButtonClick = () => {
    vscode.postMessage({
        command: "play"
    });
    const playButton = document.querySelector('.play-button');
    const pauseButton = document.querySelector('.pause-button');
    playButton.style.display = 'none';
    pauseButton.style.display = 'block';
};

const handlePauseButtonClick = () => {
    vscode.postMessage({
        command: "pause"
    });
    const pauseButton = document.querySelector('.pause-button');
    const playButton = document.querySelector('.play-button');
    pauseButton.style.display = 'none';
    playButton.style.display = 'block';
};

const handlePreviousButtonClick = () => {
    vscode.postMessage({
        command: "previous"
    });
};

const handleNextButtonClick = () => {
    vscode.postMessage({
        command: "next"
    });
};

const handleLoginButtonClick = async () => {
    vscode.postMessage({
        command: "login"
    });
};


// When DOM is loaded, attatch all event listeners
window.addEventListener('DOMContentLoaded', (event) => {
    const playButton = document.querySelector('.play-button');
    playButton.addEventListener('click', handlePlayButtonClick);

    const pauseButton = document.querySelector('.pause-button');
    pauseButton.addEventListener('click', handlePauseButtonClick);

    const previousButton = document.querySelector('.previous-button');
    previousButton.addEventListener('click', handlePreviousButtonClick);

    const nextButton = document.querySelector('.next-button');
    nextButton.addEventListener('click', handleNextButtonClick);
    
    const loginButton = document.querySelector('.login-button');
    loginButton.addEventListener('click', handleLoginButtonClick);
});

const login = () => {
    const loginButton = document.querySelector('.login-button');
    const controllerContainer = document.querySelector('.controller-container');
    
    loginButton.style.display = 'none';
    controllerContainer.style.display = 'flex';
};

window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.command) {
        case 'login':
            login();
            break;
        default:
            break;
    }
});
