let subreddits = [];

function readSubreddits() {
    let tempSubreddits = JSON.parse(window.localStorage.getItem('subreddits'));
    for (const index in tempSubreddits) {
        addSubreddit(tempSubreddits[index]);
    }
}

function addSubreddit(name) {
    subreddits.push(name);
    const removeID = "remove" + name;
    const removeButton = `<button class='ui button' id='${removeID}'>Remove</button>`;
    const menuItem = `<a class='item' id='${name}' data-html="${removeButton}">${name}</a>`;
    $('#subredditList').append(menuItem);
    $(`#subredditList > #${name}`).popup({hoverable:true});
}

function writeSubreddits() {
    window.localStorage.setItem('subreddits', JSON.stringify(subreddits));
}

function subredditMenuItemHoverIn(e) {
    // TODO: show popup for merging or removing reddits from list
}

function subredditMenuItemHoverOut(e) {

}

function loadSubredditData(subredditData) {
    // TODO: filter for only youtube and other streaming sites
    $.each(subredditData.data.children, function(index, item) {
        let newContent = "<div class='ui segment'><a href='" + item.data.url + "'>" + item.data.title + "</a></div>";
        $('#contentPane').append(newContent);
        //$('#contentPane').append("<div class='item'>" + )
    });
}

function subredditMenuItemClick(e) {
    e.preventDefault();
    let subredditName = e.target.id;
    let targetURL = 'https://www.reddit.com/r/' + subredditName + '.json';
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
    $('#addSubredditButton').click(function(e) {
        let search = $('#searchSubreddits');
        let val = search.search('get value');
        addSubreddit(val);
        search.search('set value', '');
        writeSubreddits();
    });
}

function searchSubredditHandlers() {
    // TODO: filter subreddits that have already been added
    $('#searchSubreddits').search({
        apiSettings: {
            onResponse: function(redditResponse) {
                let response = {
                    results: []
                };
                $.each(redditResponse.names, function(index, item) {
                    response.results.push({title: item})
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
    $('#toggleSidebarContent').replaceWith(elements[+ sidebarVisible]);
}

function toggleSidebarHandlers() {
    $('#toggleSidebar').click(function() {
        $('#subredditList').sidebar('toggle');
    });
}

function topMenuHandlers() {
    toggleSidebarHandlers();

    $('#sortByDropdown').dropdown();
}

function subredditListHandlers() {
    let sidebar = $('#subredditList');
    sidebar.sidebar({context: $('.bottom.segment'),
        onVisible : updateSidebarButton,
        onHide : updateSidebarButton,
        dimPage : false
    });
    // we need to use a delegated event handler since the element being attached to needs to
    // exist already (which must be the document
    $(document).on('click', '[id^=remove]', subredditRemoveClick);
    $(document).on('click', '#subredditList > .item', subredditMenuItemClick);
}

$(function() {
    readSubreddits();

    addSubredditButtonHandlers();

    searchSubredditHandlers();

    topMenuHandlers();

    subredditListHandlers();
});

