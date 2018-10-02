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
            enablejsapi: 1
        },
        events: {
            'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange,
            'onError': onError
        }
    });
}

function onError(event) {
    // note: a 101 or 150 error indicates
    // that the video owner requested the video not be embedded
    // there doesn't seem to be a way around this except for paying for
    // a service like embedly, or by changing the video source

    // changing the video source might work, since less popular sources will typically
    // not disable embedding, and more popular sources will typically have less popular/user uploaded
    // alternatives
    // same approach should work if the video has been removed (code 100)
    const redirectErrorCodes = [100, 101, 150]
    if (redirectErrorCodes.includes(event.data)) {
        console.log('content owner requested video not be embedded');
        // TODO: handle search
    }
    // other error types should never occur
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
    return newState;
}

function onPlayerReady(event) {
    console.log('onPlayerReady called');
}

function onPlayerStateChange(event) {
    // TODO: play next video in list when video ends

}