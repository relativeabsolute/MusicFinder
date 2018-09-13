const {URL} = require('url')
const querystring = require('querystring')
const {app, BrowserWindow} = require('electron')
const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const clientID = '3cvIeV5efirucQ'
const redirectURI = 'http://musicfinder/auth_callback'
const userAgentString = 'desktop:musicfinder:v0.1.0 (by /u/relative_absolute)'
var stateString = ''

    function getStateString(length) {
        let result = ''
        for (let i = 0; i < length; i++) result += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
        return result
    }

    function getAccessToken(code, successCallback) {
        console.log('Attempting to get access token')
        if (code) {
            console.log('Getting access token')
            const https = require('https')
            const request = https.request({
                method: 'POST',
                hostname: 'www.reddit.com',
                path: '/api/v1/access_token',
                //url: 'https://www.reddit.com/api/v1/access_token',
                auth: `${clientID}:`,
                headers: { 'User-Agent' : userAgentString }
            })


            const postData = querystring.stringify({
                'grant_type' : 'authorization_code',
                'code' : code,
                'redirect_uri' : redirectURI
            })
            request.on('error', (error) => {
                console.log('Error occurred')
                console.log(error)
            })
            request.on('response', (response) => {
                console.log('Response received')
                response.on('data', (chunk) => {
                    console.log(`Chunk received: ${chunk}`)
                    successCallback(chunk)
                })
                response.on('error', (error) => {
                    console.log(`ERROR: ${JSON.stringify(error)}`)
                })
            })
            request.write(postData)
            request.end()
        }
    }

    function handleCallback(callbackUrl) {
        const urlObject = new URL(callbackUrl)
        if (urlObject.hostname != 'musicfinder') {
            return null
        }
        console.log('Handling oauth callback')
        const error = urlObject.searchParams.get('error')
        const code = urlObject.searchParams.get('code')
        const stateCheck = urlObject.searchParams.get('state')
        if (error) {
            console.log(error)
            return null
        }
        if (stateCheck != stateString) {
            console.log('Bad request')
            return null
        }
        return code
    }

    function createWindow() {
        let win = new BrowserWindow({width: 800, height: 600, 'node-integration': false, 'web-security': false})

        const stateLength = 8

        stateString = getStateString(stateLength)

        const url = `https://www.reddit.com/api/v1/authorize?client_id=${clientID}&response_type=code&response_type=code&state=${stateString}&redirect_uri=${redirectURI}&duration=permanent&scope=read identity mysubreddits`

        win.loadURL(url);

        //win.webContents.on('will-navigate', (event, newUrl) => {
        //    getAccessToken(handleCallback(newUrl))
        //})

        win.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
            getAccessToken(handleCallback(newUrl), (chunk) => {
                // TODO: handle the access token somehow
                win.loadFile("index.html")
            })
        })

        win.on('closed', () => {
            win = null
        })
    }

    app.on('ready', createWindow)

    app.on('window-all-closed', () => {
        app.quit()
    })