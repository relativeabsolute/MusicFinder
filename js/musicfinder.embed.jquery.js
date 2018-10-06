let player = null;
let currentSongTitle = '';
// number of videos to try before giving up after an error
let currentSearchDepth = 0;
const maxSearchDepth = 3;
let nextSongCallback = null;

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
    const redirectErrorCodes = [100, 101, 150];
    if (redirectErrorCodes.includes(event.data)) {
        console.log('content owner requested video not be embedded');
        // TODO: handle search
        if (currentSearchDepth < maxSearchDepth) {
            currentSearchDepth++;
            tryVideoList();
        } else {
            currentSearchDepth = 0;
        }
        // TODO: handle removing video if good one can't be found
    }
    // other error types should never occur
}

// called when an error occurs (video owner requests video not be embedded, edtc)
function tryVideoList() {
    player.loadPlaylist({list: currentSongTitle,
        listType: 'search',
        index: currentSearchDepth});
}

function setCurrentVideo(newID, title) {
    currentSongTitle = title;
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

const playerStateNames = ['ended', 'playing', 'paused', 'buffering'];
function onPlayerStateChange(event) {
    // TODO: play next video in list when video ends
    console.log('player state changed');
    console.log(`New state = ${event.data}`);
    switch (event.data) {
        case YT.PlayerState.PLAYING:
            console.log('Now playing');
            currentSearchDepth = 0;
            break;
        case YT.PlayerState.ENDED:
            if (nextSongCallback != null) {
                nextSongCallback();
            }
            break;
    }
}