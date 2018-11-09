// file for handling data

let idToIndex = {};

// result contains meta data related to each song
// some data comes from reddit, and also whether the user has liked the song
let songData = [];

// object containing subreddits, likedSongs, etc
let dataModel = {
    likedSongs : [],
    subreddits : []
};

const LIKED_SONGS_KEY = "likedSongs";
const SUBREDDITS_KEY = "subreddits";

const VOTE_TYPE_UP = 'up';
const VOTE_TYPE_DOWN = 'down';

// TODO: implement playback queue, separate from song data and likedSongs

function _songDataFromPostTitle(title) {
    const array = title.match(/([^\[(]+)-([^\[(]+)(\[.+])?(\(.+\))?/);
    if (array == null) {
        return null;
    } else {
        let genre = '';
        if (array[3] != null) {
            genre = array[3].trim();
        }
        return SongData(array[2].trim(), array[1].trim(), genre);
    }
}

function PostData(title, author, score, subreddit, youtubeID) {
    let result = {};
    result.title = title;
    result.author = author;
    result.score = score;
    result.subreddit = subreddit;
    result.youtubeID = youtubeID;
    result.songData = _songDataFromPostTitle(title);
    return result
}

function SongData(title, artist, genre) {
    let result = {};
    result.title = title;
    result.artist = artist;
    result.genre = genre;
    return result;
}

function _postDataFromSubredditData(itemData) {
    return PostData(itemData.data.title, itemData.data.author,
        itemData.data.score, itemData.data.subreddit,
        itemData.data.url.match(/youtu.be\/(.+)/)[1]);
}

function addPostData(item) {
    let newObject = _postDataFromSubredditData(item);
    if (newObject.songData == null) {
        return null;
    }
    addToSongData(newObject);
    return newObject;
}

function addToSongData(songObject) {
    idToIndex[songObject.youtubeID] = songData.length;
    songData.push(songObject);
}

function getPostDataByID(youtubeID) {
    return songData[idToIndex[youtubeID]];
}

function getPostData(index) {
    return songData[index];
}

function getPostIndexByID(youtubeID) {
    return idToIndex[youtubeID];
}

function voteSong(youtubeID, voteType) {
    let findYoutubeID = (item) => { return item.youtubeID === youtubeID };
    index = dataModel[LIKED_SONGS_KEY].findIndex(findYoutubeID);
    if (index === -1 && voteType === VOTE_TYPE_UP) {
        let postData = getPostDataByID(youtubeID);
        // TODO: determine if we want to store reddit info as well
        dataModel[LIKED_SONGS_KEY].push(postData);
    } else if (index !== -1 && voteType === VOTE_TYPE_DOWN) {
        dataModel[LIKED_SONGS_KEY].splice(index, 1);
    }
    /*if (!dataModel[LIKED_SONGS_KEY].hasOwnProperty(youtubeID) && voteType === VOTE_TYPE_UP) {
        let postData = getPostDataByID(youtubeID);
        // TODO: determine if we want to store reddit info as well
        dataModel[LIKED_SONGS_KEY][youtubeID] = postData.songInfo;
    } else if (dataModel[LIKED_SONGS_KEY].hasOwnProperty(youtubeID) && voteType === VOTE_TYPE_DOWN) {
        delete dataModel[LIKED_SONGS_KEY][youtubeID];
    }*/
    writeDataItem(LIKED_SONGS_KEY);
}

function removeSubreddit(name) {
    const index = dataModel[SUBREDDITS_KEY].indexOf(name);
    if (index !== -1) {
        dataModel[SUBREDDITS_KEY].splice(index, 1);
        writeDataItem(SUBREDDITS_KEY);
    }
}

function addSubreddit(name) {
    dataModel[SUBREDDITS_KEY].push(name);
    writeDataItem(SUBREDDITS_KEY);
}

function writeDataItem(key) {
    window.localStorage.setItem(key, JSON.stringify(dataModel[key]));
}

function getDataItem(key) {
    const result = JSON.parse(window.localStorage.getItem(key));
    if (result != null && !(result.length === 0)) {
        dataModel[key] = result;
    }
    return dataModel[key];
}