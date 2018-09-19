let subreddits = [];
let toggleState = 0;

function readSubreddits() {
    let tempSubreddits = JSON.parse(window.localStorage.getItem('subreddits'));
    console.log('subreddits:');
    for (var index in tempSubreddits) {
        console.log(tempSubreddits[index]);
        addSubreddit(tempSubreddits[index]);
    }
}

function addSubreddit(name) {
    subreddits.push(name);
    let menuItem = "<a class='item' id='" + name + "'>" + name + "</a>"
    $('#subredditList').append(menuItem);
}

function writeSubreddits() {
    console.log('subreddits');
    for (var index in subreddits) {
        console.log(subreddits[index]);
    }
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
        console.log('new content' + newContent);
        $('#contentPane').append(newContent);
        console.log('item' + item['data']['url']);
        //$('#contentPane').append("<div class='item'>" + )
    });
}

function subredditMenuItemClick(e) {
    e.preventDefault();
    let subredditName = e.target.id;
    // TODO: call subreddit api and load stuff
    let targetURL = 'https://www.reddit.com/r/' + subredditName + '.json';
    // TODO: set loading indicator
    $.get(targetURL, loadSubredditData);
}

$(function() {
    readSubreddits();

    // TODO: use local storage
    $('#addSubredditButton').click(function(e) {
        let search = $('#searchSubreddits');
        let val = search.search('get value');
        addSubreddit(val);
        search.search('set value', '');
        writeSubreddits();
    });

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

    $('#toggleSidebar').click(function() {
        const elements = ["<div id='toggleSidebarContent'><i class='angle left icon'></i>Hide Subreddits</a></div>",
            "<div id='toggleSidebarContent'><i class='angle right icon'></i>Show Subreddits</div>"];
        $('#subredditList').sidebar('toggle');
        toggleState = 1 - toggleState;
        $('#toggleSidebarContent').replaceWith(elements[toggleState]);
    })
    $('#subredditList').sidebar({context: $('.bottom.segment')});
    $('#subredditList > .item')
        .hover(subredditMenuItemHoverIn, subredditMenuItemHoverOut)
        .click(subredditMenuItemClick);
});

