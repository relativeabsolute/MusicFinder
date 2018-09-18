let subreddits = [];

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
    $('#subredditList').append("<a class='item'>" + name + "</a>");
}

function writeSubreddits() {
    console.log('subreddits');
    for (var index in subreddits) {
        console.log(subreddits[index]);
    }
    window.localStorage.setItem('subreddits', JSON.stringify(subreddits));
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
});

