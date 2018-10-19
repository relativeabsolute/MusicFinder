let currentSongIndex = 0;

function initSubreddits() {
    const tempSubreddits = getDataItem(SUBREDDITS_KEY);
    $.each(tempSubreddits, function (index, item) {
        addSubredditHTML(item);
    });
}

function addSubredditHTML(name) {
    const removeID = `remove${name}`;
    const removeButton = `<button class='ui button' id='${removeID}'>Remove</button>`;
    const menuItem = `<a class='item' id='${name}' data-html="${removeButton}">${name}</a>`;
    $('#subredditList').append(menuItem);
    $(`#subredditList > #${name}`).popup({hoverable: true});
}

function newSubreddit(name) {
    addSubreddit(name);
    // TODO: change popup to appear below item, and add subreddit info modal dialog
    addSubredditHTML(name);
}

function voteButtonClick() {
    const match = $(this).attr('id').match(/vote(\w+):(.+)/);
    const type = match[1];
    const id = match[2];
    voteSong(id, type);
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
                // TODO: make buttons show on right
                const newContent = `<div class='ui segment'>
                    <a id='${obj.youtubeID}'>${obj.postTitle}</a>
                    <div class="ui icon buttons">
                    <button class="ui button" id="vote${VOTE_TYPE_UP}:${obj.youtubeID}">
                    <i class="caret up icon"></i>
                    </button>
                    <button class="ui button" id="vote${VOTE_TYPE_DOWN}:${obj.youtubeID}">
                    <i class="caret down icon"></i>
                    </button>
                    </div>
                    </div>`;
                //$('.ui.segment').on('click', 'a', playLink);
                contentPane.append(newContent);
                //$(`#${obj.youtubeID}`).hover(postItemHover);
                counter++;
            }

        }
    });
    $('#contentPane > .ui.segment').hover(postItemHover);
    $('#contentPane > .ui.segment > .ui.buttons').hide();
    $('button[id^="vote"]').click(voteButtonClick);
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
    removeSubreddit(id);
    $(`#${id}`).remove();
}

function addSubredditButtonHandlers() {
    $('#addSubredditButton').click(function (e) {
        let search = $('#searchSubreddits');
        let val = search.search('get value');
        newSubreddit(val);
        search.search('set value', '');
    });
}

function nextSong() {
    if (currentSongIndex < songData.length - 1) {
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

function postItemHover(e) {
    //console.log('post item hovered');
    //console.log(e.target);
    let buttons = $(this).find('.ui.buttons');
    //console.log(buttons);
    buttons.transition('toggle');
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
    sidebar.on('click', '.item', subredditMenuItemClick);
    $('.ui.segment').on('click', 'a', playLink);
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
    initSubreddits();
    initYoutube();
    addSubredditButtonHandlers();
    searchSubredditHandlers();
    topMenuHandlers();
    sidebarHandlers();
});

