let subreddits = [];

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
    $.each(subredditData.data.children, function (index, item) {
        // TODO: setup media player interface
        if (item.data.domain === 'youtu.be') {
            if (first) {
                // TODO: autoplay
                first = false;
                const youtubeID = item.data.url.match(/youtu.be\/(\w+)/)[1];
                $('.ui.embed').embed({
                    url : `https://www.youtube.com/embed/${youtubeID}`
                });
            }
            const newContent = `<div class='ui segment'><a href='${item.data.url}'>${item.data.title}</a></div>`;
            contentPane.append(newContent);
        }
    });
    // TODO: set up buttons on top menu bar to interact with content player
    $('.sidebar').sidebar('toggle');
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
    const elements = ["<div id='toggleSidebarContent'><i class='angle left icon'></i>Hide Subreddits</a></div>",
        "<div id='toggleSidebarContent'><i class='angle right icon'></i>Show Subreddits</div>"];
    const sidebarVisible = $('#subredditList').sidebar('is visible');
    $('#toggleSidebarContent').replaceWith(elements[+sidebarVisible]);
}

// event handlers for the menu across the top
function topMenuHandlers() {
    $('#toggleSidebar').click(function () {
        $('.sidebar').sidebar('toggle');
    });

    $('#sortByDropdown').dropdown();
}

function subredditListHandlers() {
    let sidebar = $('#subredditList');
    sidebar.sidebar({
        context: $('.bottom.segment'),
        onVisible: updateSidebarButton,
        onHide: updateSidebarButton,
        dimPage: false,
        transition: 'overlay'
    });
    // we need to use a delegated event handler since the element being attached to needs to
    // exist already (which must be the document)
    $(document).on('click', '[id^=remove]', subredditRemoveClick);
    $(document).on('click', '#subredditList > .item', subredditMenuItemClick);
}

function sidebarHandlers() {
    subredditListHandlers();

    $('#contentPlayer').sidebar({
        context: $('.bottom.segment'),
        dimPage: false,
        transition: 'overlay'
    });
}

// this gets called when the document is ready
// attach all the event handlers and do whatever else needs to be done on startup
$(function () {
    readSubreddits();

    addSubredditButtonHandlers();

    searchSubredditHandlers();

    topMenuHandlers();

    sidebarHandlers();
});

