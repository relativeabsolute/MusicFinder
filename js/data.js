// file for handling data

let idToIndex = {};
let subredditContent = [];

// returns object containing title and artist
function getSongInfo(postTitle) {
    // TODO: use named capture groups
    const array = postTitle.match(/([^\[(]+)-([^\[(]+)(\[.+])?(\(.+\))?/);

    if (array == null) {
        return null;
    } else {
        console.log(array);
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
    // TODO: allow for different handlers based on url
    resultObject.youtubeID = itemData.data.url.match(/youtu.be\/(.+)/)[1];
    return resultObject;
}

function addPostData(item) {
    let newObject = constructPostData(item);
    if (newObject == null) {
        return null;
    }
    idToIndex[newObject.youtubeID] = subredditContent.length;
    subredditContent.push(newObject);
    return newObject;
}

function getPostData(index) {
    return subredditContent[index];
}

function getPostIndexByID(youtubeID) {
    return idToIndex[youtubeID];
}