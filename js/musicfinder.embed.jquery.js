let player = null;

function initYoutubeAPI() {
    let asyncScript = document.createElement('script');

    asyncScript.src = 'https://www.youtube.com/iframe_api';
    $('#contentPlayer').after(asyncScript);
}

function onYouTubeIframeAPIReady() {
    console.log('onYoutubeIframeAPIReady called');
    player = new YT.Player('musicPlayer', {
        playerVars : {
            autoplay : 0,
        },
        events: {
            'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange
        }
    });
}

function setCurrentVideo(newID) {
    player.loadVideoById(newID);
}

function togglePlayPause() {
    let currentState = player.getPlayerState();
    let newState = 0;
    switch (currentState) {
        case YT.PlayerState.PLAYING:
            player.pauseVideo();
            break;
        case YT.PlayerState.PAUSED:
            player.playVideo();
            newState = 1;
            break;
    }
    return newState
}

function onPlayerReady(event) {
    console.log('onPlayerReady called');
}

function onPlayerStateChange(event) {
    // TODO: play next video in list when video ends

}