// file for handling data

let idToIndex = {};

// this contains meta data related to each song
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

// returns object containing title and artist
function getSongInfo(postTitle) {
    // TODO: use named capture groups
    const array = postTitle.match(/([^\[(]+)-([^\[(]+)(\[.+])?(\(.+\))?/);

    if (array == null) {
        return null;
    } else {
        let resultObj = {};
        resultObj.songTitle = array[2].trim();
        resultObj.songArtist = array[1].trim();
        if (array[3] != null) {
            resultObj.songGenre = array[3].trim();
        } else {
            resultObj.songGenre = '';
        }
        return resultObj;
    }
}

function constructPostData(itemData) {
    let resultObject = {};
    let postTitle = itemData.data.title;
    resultObject.postTitle = postTitle;
    resultObject.songInfo = getSongInfo(postTitle);
    if (resultObject.songInfo == null) {
        return null;
    }
    console.log(`itemData: ${JSON.stringify(itemData)}`);
    resultObject.author = itemData.data.author;
    resultObject.score = itemData.data.score;
    resultObject.subreddit = itemData.data.subreddit;
    // TODO: allow for different handlers based on url
    resultObject.youtubeID = itemData.data.url.match(/youtu.be\/(.+)/)[1];
    return resultObject;
}

function addPostData(item) {
    let newObject = constructPostData(item);
    if (newObject == null) {
        return null;
    }
    idToIndex[newObject.youtubeID] = songData.length;
    songData.push(newObject);
    return newObject;
}

function getPostData(index) {
    return songData[index];
}

function getPostIndexByID(youtubeID) {
    return idToIndex[youtubeID];
}

function voteSong(youtubeID, voteType) {
    const index = dataModel[LIKED_SONGS_KEY].indexOf(youtubeID);
    if (index === -1 && voteType === VOTE_TYPE_UP) {
        dataModel[LIKED_SONGS_KEY].push(youtubeID);
        writeDataItem(LIKED_SONGS_KEY);
    } else if (index !== -1 && voteType === VOTE_TYPE_DOWN) {
        dataModel[LIKED_SONGS_KEY].splice(index, 1);
        writeDataItem(LIKED_SONGS_KEY);
    }
}

function removeSubreddit(name) {
    const index = subreddits.indexOf(name);
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
    dataModel[key] = JSON.parse(window.localStorage.getItem(key));
    return dataModel[key];
}