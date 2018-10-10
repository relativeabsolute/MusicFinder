let subreddits = [];
let currentSongIndex = 0;

function readSubreddits() {
    let tempSubreddits = JSON.parse(window.localStorage.getItem('subreddits'));
    $.each(tempSubreddits, function (index, item) {
        addSubreddit(item);
    });
}

function addSubredditHTML(name) {
    const removeID = `remove${name}`;
    const removeButton = `<button class='ui button' id='${removeID}'>Remove</button>`;
    const menuItem = `<a class='item' id='${name}' data-html="${removeButton}">${name}</a>`;
    $('#subredditList').append(menuItem);
    $(`#subredditList > #${name}`).popup({hoverable: true});
}

function addSubreddit(name) {
    subreddits.push(name);
    // TODO: change popup to appear below item, and add subreddit info modal dialog
    addSubredditHTML(name);
}

function writeSubreddits() {
    window.localStorage.setItem('subreddits', JSON.stringify(subreddits));
}

function loadSubredditData(subredditData) {
    // TODO: filter for only youtube and other streaming sites
    let contentPane = $('#contentPane');
    contentPane.empty();
    let first = true;
    let counter = 0;
    $.each(subredditData.data.children, function (index, item) {
        // TODO: organize handlers for different domains
        if (item.data.domain === 'youtu.be') {
            let obj = addPostData(item);
            if (obj != null) {
                if (first) {
                    first = false;
                    currentSongIndex = counter;
                    playItem(obj.youtubeID);
                }
                // TODO: might be prettier to simply do Artist - Title
                const newContent = `<div class='ui segment'><a id='${obj.youtubeID}'>${obj.postTitle}</a></div>`;
                contentPane.append(newContent);
                counter++;
            }

        }
    });
    // TODO: set up buttons on top menu bar to interact with content player
    // hide subreddits sidebar and show content sidebar
    $('#subredditList').sidebar('hide');
    $('#contentPlayer').sidebar('show');
}

function subredditMenuItemClick(e) {
    e.preventDefault();
    let subredditName = e.target.id;
    let targetURL = `https://www.reddit.com/r/${subredditName}.json`;
    // TODO: set loading indicator
    $.get(targetURL, loadSubredditData);
}

function subredditRemoveClick(e) {
    const id = e.target.id.match(/remove(\w+)/)[1];
    const index = subreddits.indexOf(id);
    subreddits.splice(index, 1);
    $(`#${id}`).remove();
    writeSubreddits();
}

function addSubredditButtonHandlers() {
    $('#addSubredditButton').click(function (e) {
        let search = $('#searchSubreddits');
        let val = search.search('get value');
        addSubreddit(val);
        search.search('set value', '');
        writeSubreddits();
    });
}

function nextSong() {
    if (currentSongIndex < subredditContent.length - 1) {
        currentSongIndex++;
        playItemAtIndex(currentSongIndex);
    }
}

function playItemAtIndex(index) {
    let toPlay = getPostData(index);
    console.log(toPlay);
    let title = `${toPlay.songInfo.songArtist} - ${toPlay.songInfo.songTitle}`;
    console.log(`title is ${title}`);
    setCurrentVideo(toPlay.youtubeID, title);
    $('#postTitle').html(`Post Title: ${toPlay.postTitle}`);
    $('#postAuthor').html(`Posted by: /u/${toPlay.author}`);
    $('#postScore').html(`Post score: ${toPlay.score}`);
    // TODO: add collapsible for song info
    $('#songArtist').html(`Artist: ${toPlay.songInfo.songArtist}`);
    $('#songTitle').html(`Title: ${toPlay.songInfo.songTitle}`);
    // TODO: may not want to include genre (not every subreddit has it)
    $('#songGenre').html(`Genre: ${toPlay.songInfo.songGenre}`);
}

function playItem(youtubeID) {
    playItemAtIndex(getPostIndexByID(youtubeID));
}

function playLink(e) {
    e.preventDefault();
    playItem(e.target.id);
    $('#contentPlayer').sidebar('show');
}

function initYoutube() {
    initYoutubeAPI();

    nextSongCallback = nextSong;
}

function searchSubredditHandlers() {
    $('#searchSubreddits').search({
        apiSettings: {
            onResponse: function (redditResponse) {
                let response = {
                    results: []
                };
                $.each(redditResponse.names, function (index, item) {
                    if (!subreddits.includes(item)) {
                        response.results.push({title: item})
                    }
                });
                return response
            },
            url: 'https://www.reddit.com/api/search_reddit_names.json?query={query}&include_over_18=false'
        },
        minCharacters: 2
    });
}

function updateSidebarButton() {
    const elements = ["<i class='angle left icon'></i>Hide Subreddits</a>",
        "<i class='angle right icon'></i>Show Subreddits"];
    const sidebarVisible = $('#subredditList').sidebar('is visible');
    $('#toggleSidebar').html(elements[+sidebarVisible]);
}

function togglePlayPauseClick() {
    const newContent = ["Pause", "Play"];
    let state = togglePlayPause();
    $('#togglePlayPauseButton').html(newContent[state]);
}

// event handlers for the menu across the top
function topMenuHandlers() {
    $('#toggleSidebar').click(function () {
        $('#subredditList').sidebar('toggle');
    });

    $('#sortByDropdown').dropdown();

    $('#togglePlayPauseButton').click(togglePlayPauseClick);

    $('#nextVideoButton').click(nextSong);
}

function subredditListHandlers() {
    let sidebar = $('#subredditList');
    sidebar.sidebar({
        context: $('.bottom.segment'),
        exclusive: false,
        closable: false,
        onVisible: updateSidebarButton,
        onHide: updateSidebarButton,
        dimPage: false,
        transition: 'overlay'
    });
    // we need to use a delegated event handler since the element being attached to needs to
    // exist already (which must be the document)
    $(document).on('click', '[id^=remove]', subredditRemoveClick);
    $(document).on('click', '#subredditList > .item', subredditMenuItemClick);
    $(document).on('click', '.ui.segment > a', playLink);
}

function sidebarHandlers() {
    subredditListHandlers();

    // TODO: make sidebar wide enough for whole youtube video
    $('#contentPlayer').sidebar({
        context: $('.bottom.segment'),
        exclusive: false,
        dimPage: false,
        closable: false,
        transition: 'overlay'
    });
}

// this gets called when the document is ready
// attach all the event handlers and do whatever else needs to be done on startup
$(function () {
    readSubreddits();

    initYoutube();

    addSubredditButtonHandlers();

    searchSubredditHandlers();

    topMenuHandlers();

    sidebarHandlers();
});

