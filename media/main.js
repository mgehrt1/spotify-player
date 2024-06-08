const handlePreviousButtonClick = () => {
    console.log("Previous Button Clicked");
};

const handlePlayButtonClick = () => {
    console.log("Play Button Clicked");
};

const handleNextButtonClick = () => {
    console.log("Next Button Clicked");
};


// When DOM is loaded, attatch all event listeners
window.addEventListener('DOMContentLoaded', (event) => {
    const previousButton = document.querySelector('.previous-button');
    if (previousButton) {
        previousButton.addEventListener('click', handlePreviousButtonClick);
    }

    const playButton = document.querySelector('.play-button');
    if (playButton) {
        playButton.addEventListener('click', handlePlayButtonClick);
    }

    const nextButton = document.querySelector('.next-button');
    if (nextButton) {
        nextButton.addEventListener('click', handleNextButtonClick);
    }
});