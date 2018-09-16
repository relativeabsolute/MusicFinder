$(function() {
    // TODO: use local storage
    $('#addSubredditButton').click(function(e) {
        // TODO: verify that it is a valid subreddit
        let search = $('#searchSubreddits');
        let val = search.search('get value');
        $('#subredditList').append("<a class='item'>" + val + "</a>");
        search.search('set value', '');
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
