//Class definition for an entry in the ALBUM_LIST array
class album_entry {

    constructor(album) {

        this.album = album;
        this.count = 1;

    }

    incrementCount() { this.count = this.count + 1; }

    getCount() { return this.count; }

}

//Get the URL of the current page
const CURRENT_URL = window.location.href;

//Get the access token
const ACCESS_TOKEN = CURRENT_URL.substring(CURRENT_URL.indexOf("=") + 1, CURRENT_URL.indexOf("&"));

function main() {

    //If url does not have "#" in it, then we have not clicked the login button yet
    if (CURRENT_URL.indexOf("#") == -1) {

        //Hide the loding bar and album_images div
        document.getElementById("loading_bar").style.display = "none";
        document.getElementById("album_images").style.display = "none";

        //Set client ID and redirect_uri for the Spotify web app
        var client_id = 'cd65bb285db248e4b6352828ac986b66';
        var redirect_uri = CURRENT_URL;

        //Generate random 16-character string for state
        var state = generateRandomString(16);

        //Save stateKey with state
        var stateKey = 'spotify_auth_state';
        localStorage.setItem(stateKey, state);

        //user-library-read is the only scope that needs to be requested in order to get the users 
        //saved tracks
        var scope = 'user-library-read';

        //Add the "Hosted on GitHub" button
        const github_button = document.getElementById("github_button");
        github_button.addEventListener('click', () => {
            window.location = "https://github.com/RustyReich/Top-Spotify-Albums";
        });

        //Redirect to "Authorization" spotify link upon clicking login_button
        const login_button = document.getElementById("login_button");
        login_button.addEventListener('click', () => {

            var url = 'https://accounts.spotify.com/authorize';
            url += '?response_type=token';
            url += '&client_id=' + encodeURIComponent(client_id);
            url += '&scope=' + encodeURIComponent(scope);
            url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
            url += '&state=' + encodeURIComponent(state);

            window.location = url;

        });

    }
    else {  //If there is a "#" in the URL, we have clicked the login button

        //So hide the main square
        document.getElementById("main_square").style.display = "none"

        //Set up an interval to update the loading bar while we load all the tracks and albums
        LOADING_BAR_INTERVAL = setInterval(updateLoadingBar, 1)

        //Request all the users tracks, and call printResults after all tracks have been receieved
        requestAllTracks(printResults)

    }

}

//Generate a random string of letters and digits that is the specified length
function generateRandomString(length) {

    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    var result = '';
    for (var i = 0; i < length; i++)
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    return result;

}

//Check if an album is already in the ALBUM_LIST array
    //Returns the index in the array if the album is in ALBUM_LIST
    //Returns -1 if the album is not in ALBUM_LIST
function albumInList(currAlbum) {

    var num_of_albums = Object.keys(ALBUM_LIST).length;

    for (var i = 0; i < num_of_albums; i++)
        if (ALBUM_LIST[i].album.id == currAlbum.id)
            return i;
    return -1;

}

//Sort ALBUM_LIST by number of tracks saved in album
function quickSortAlbumList(low, hight) {

    if (low < hight) {

        var pi = partition(low, hight);

        quickSortAlbumList(low, pi - 1);
        quickSortAlbumList(pi + 1, hight);

    }

    function partition(low, high) {

        var pivot = ALBUM_LIST[high];
        var i = (low - 1);
    
        for (var j = low; j <= high - 1; j++) {
    
            if (ALBUM_LIST[j].count > pivot.count) {
    
                i++;
                swap(i, j);
    
            }
    
        }
    
        swap(i + 1, high);
        return (i + 1);
    
    }
    
    function swap(i, j) {
    
        var temp = ALBUM_LIST[i];
        ALBUM_LIST[i] = ALBUM_LIST[j];
        ALBUM_LIST[j] = temp;
    
    }

}

//Print results to the page
function printResults() {

    //Set up an interval to resize all text in album_images div when the window is resized
    var WINDOW_RESIZED_INTERVAL;
    window.onresize = function() {
        //It waits until the window has not been resized in 100ms before calling resizeAllText()
            //This is so we can make the assumption that the user is done resizing the window
        clearTimeout(WINDOW_RESIZED_INTERVAL);
        WINDOW_RESIZED_INTERVAL = setTimeout(function() { resizeAllText(); }, 100);
    };

    //Hide the loading bar
    document.getElementById("loading_bar").style.display = "none"

    //Get the number of albums
    const num_of_albums = Object.keys(ALBUM_LIST).length
    
    //Sort the albums
    quickSortAlbumList(0, num_of_albums - 1)

    //Re-display the main_square element
    const main_square = document.getElementById("main_square");
    main_square.style.display = "block";

    //But hide the text in the main_square_element as well as the login button
    document.getElementById("main_square_text").style.display = "none"
    document.getElementById("login_button").style.display = "none"

    //Resize and re-position the main_square 
    main_square.style.width = "98%";
    main_square.style.height = "90%";
    main_square.style.position = "fixed";
    main_square.style.left = "1%";
    main_square.style.top = "9vmin";

    //Set new formatting attributes for main_square
    main_square.style.color = "white";
    main_square.style.textAlign = "left";
    main_square.style.fontSize = "2vmin";
    main_square.style.fontFamily = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif";
    main_square.style.whiteSpace = "pre-line"
    main_square.style.overflowY = "scroll"
    main_square.style.overflowX = "hidden"

    //Set album_images div to be displayed
    document.getElementById("album_images").display = "block"

    //Load all albums into the album_images div
    var album_id = 0;
    //An interval is set to load one album at a time, every 1ms
        //This is to ensure the page remains responsive while loading them
    const LOADING_ALBUMS_INTERVAL = setInterval(loadAlbum, 1);
    function loadAlbum() {

        //Create a div for the current album information
        const div = document.createElement("div");
        div.setAttribute("id", "album_div_" + album_id);    //Give it an id

        //Set some style attributes for the div
        div.style.width = "98.5%";
        div.style.height = "20vmin";
        div.style.background = "#282828";
        div.style.color = "white";
        div.style.borderRadius = "1vmin"
        
        //Ensure the first albums does not have the same top-margin as the rest of the albums
        if (album_id != 0)
            div.style.marginTop = "1vmin";

        //Append album images to the div
        const img = new Image();
        img.src = ALBUM_LIST[album_id].album.images[0].url;
        div.appendChild(img);

        //Append album name to div
        var name = document.createElement("h1");
        name.textContent = ALBUM_LIST[album_id].album.name;
        //name.style.left = pixelsToVmin(img.offsetWidth) + 1 + "vmin"
        div.appendChild(name);

        //Append album band to div
        var band = document.createElement("h2");
        band.textContent = ALBUM_LIST[album_id].album.artists[0].name;
        div.appendChild(band);

        //Append saved-song count to div
        var count = document.createElement("h3");
        count.textContent = ALBUM_LIST[album_id].getCount() + " songs saved";
        div.appendChild(count);

        //Append div to album_images div
        document.getElementById("album_images").appendChild(div);

        //Fit text for all three children into the div boundaries
        fitText(div, name);
        fitText(div, band);
        fitText(div, count);

        //Clear interval after we have loaded all albums
        if (album_id < num_of_albums - 1)
            album_id = album_id + 1;
        else
            clearInterval(LOADING_ALBUMS_INTERVAL);
    }

    //clear LOADING_BAR_INTERVAL once we are done loading all tracks
    clearInterval(LOADING_BAR_INTERVAL);

}

//Maximum amount of tracks that can be requested at one time
    //This is a limitation imposed by the Spotify Web API
const MAX_REQUESTS_AT_A_TIME = 50;

//Variables used for receiving and storing tracks and albums
var ALBUM_LIST = []
var TOTAL_TRACKS = Infinity
var TRACKS_RECEIVED = 0

//Request all tracks saved by the user
    //callback is the function to be called after all tracks have been received
function requestAllTracks(callback) {

    //Send request for first MAX_REQUEST_AT_A_TIME number of tracks
        //requestRemaining is passed as the callback so that it gets called after the first set of 
        //tracks have been received
    sendRequest(MAX_REQUESTS_AT_A_TIME, 0, requestRemaining, callback)

}

//Function to be called after the first set of tracks have been receieved.
    //The first set of tracks must be receieved separately so that we can find out how many 
    //TOTAL_TRACKS there are.
    //Once we know TOTAL_TRACKS, we can send requests for all other tracks
        //callback is the function to be called after all responses have been received
function requestRemaining(callback) {

    //As long as there are still more tracks to receive, keep sending requests
    if (TOTAL_TRACKS > TRACKS_RECEIVED) {

        //Make sure to not request more tracks than are remaining
        if (MAX_REQUESTS_AT_A_TIME > TOTAL_TRACKS - TRACKS_RECEIVED)
            sendRequest(TOTAL_TRACKS - TRACKS_RECEIVED, TRACKS_RECEIVED, requestRemaining, callback);
        else
            sendRequest(MAX_REQUESTS_AT_A_TIME, TRACKS_RECEIVED, requestRemaining, callback)

    }
    else    //Once we have receieved all tracks, call the callback function
        if (typeof callback == 'function')
            callback();

}

//Funcion that actually sends the requests for tracks
    //amount is the number of tracks to request
    //offset is the index of the first track
    //callback is the function to run after the current request has received a response
    //args are the arguments to that callback function
function sendRequest(amount, offset, callback, ...args) {

    //Craft request url
    var request_url = "https://api.spotify.com/v1/me/tracks?";
    request_url += "&limit=" + amount;
    request_url += "&offset=" + offset;

    const xhr = new XMLHttpRequest();

    //receieveResponse gets called once the request has receieved a response
    xhr.callback = receieveResponse;
    //We pass callback and its arguments to receieveResponse 
    xhr.arguments = Array.prototype.slice.call(arguments, 2)
    xhr.onload = xhrSuccess;
    xhr.onerror = xhrError;

    //Make sure to include ACCESS_TOKEN in headers
    xhr.open("GET", request_url, true);
    xhr.setRequestHeader("Authorization", "Bearer " + ACCESS_TOKEN);
    xhr.send(null)

}

//Function that gets called once a response for a request has been receieved
function receieveResponse(callback, ...args) {

    //Convert JSON response into object
    const raw_response = this.responseText;
    const response = JSON.parse(raw_response);

    //Save total number of tracks
    TOTAL_TRACKS = response.total;

    //Count the number of tracks that were receieved in the response
    const num_tracks_received = Object.keys(response.items).length;

    //For every track received in the current response
    for (var i = 0; i < num_tracks_received; i++) {

        //Check if the current tracks album is already in the ALBUM_LIST array
        current_tracks_album = response.items[i].track.album;
        album_list_id = albumInList(current_tracks_album);

        //If it is not in the array
        if (album_list_id == -1) {

            //Push the album onto the array
            const curr_album_entry = new album_entry(current_tracks_album);
            ALBUM_LIST.push(curr_album_entry);

        }
        else    //If it is in the array already, then increment the count for the album
            ALBUM_LIST[album_list_id].incrementCount();

    }

    //Keep track of the number of tracks receieved so far
    TRACKS_RECEIVED += num_tracks_received;

    //Call the callback function if it is present
    if (typeof callback == 'function')
    {

        //Callback should only ever be passed here with a single or no arguments. If there is a single
        //argument, that argument should be another callback function.
            //So here, we just check if that argument is there, and call callback() with that argument
            //if it is there
        if (typeof arguments[1] == 'function')
            callback(arguments[1]);
        else    //If it's not there, just call callback() with no argument
            callback();

    }

}

//Variables used for animating the loading circle
var LOADING_BAR_INTERVAL;
var TICKS_SPENT_LOADING = 0
const LOADING_BAR_RADIUS = pixelsToVmin(getComputedStyle(loading_bar_moving_circle).bottom);

//Function that animated the loading circle
function updateLoadingBar() {

    const TICKS_PER_ROTATION = 240;
    const PI = 3.14159

    //Calcuate the current t value for calculating the X and Y values of the moving_circle
    t = TICKS_SPENT_LOADING / TICKS_PER_ROTATION * 2 * PI
    
    //Calculate X and Y for moving_circle
    x = Math.cos(t)
    y = Math.sin(t)

    //Set X any Y values for moving_circle
    loading_bar_moving_circle.style.bottom = x * LOADING_BAR_RADIUS + "vmin";
    loading_bar_moving_circle.style.left = y * LOADING_BAR_RADIUS + "vmin";

    //Keep track of how many milliseconds the loading circle has been active
    TICKS_SPENT_LOADING++;

    //Show the percentage of tracks recieved in the middle of the loading circle
    const loading_bar_percentage = document.getElementById("loading_bar_percentage");
    loading_bar_percentage.textContent = Math.round(100 * TRACKS_RECEIVED / TOTAL_TRACKS);

}

//Convert a value in the form "123px" to Number(123)
function pixelsToNumber(string) {

    return Number(string.substring(0, string.indexOf("px")));

}

//Convert a value measured in pixels to one measured in vmin
function pixelsToVmin(num_of_pixels) {

    if (typeof num_of_pixels === 'string' || num_of_pixels instanceof String)
        num_of_pixels = pixelsToNumber(num_of_pixels)
    return num_of_pixels * 100 / Math.min(window.innerWidth, window.innerHeight);

}

//Get the default fontsize for h1, h2, and h3 childen of the album_images div
    //fontSize will never be greater than these
const DEFAULT_H1_FONT_SIZE = pixelsToVmin(getComputedStyle(document.getElementById("album_images").getElementsByTagName("h1")[0]).fontSize);
const DEFAULT_H2_FONT_SIZE = pixelsToVmin(getComputedStyle(document.getElementById("album_images").getElementsByTagName("h2")[0]).fontSize);
const DEFAULT_H3_FONT_SIZE = pixelsToVmin(getComputedStyle(document.getElementById("album_images").getElementsByTagName("h3")[0]).fontSize);

//Function for reposition text so that it is exactly 1vmin to the right of the album art
    //This is because not all albums art have a standard size for some reason
function positionTextBasedOnAlbumWidth(img_element, text_element) {

    //Get the image left and width 
    img_left = pixelsToVmin(getComputedStyle(img_element).left)
    img_width = pixelsToVmin(img_element.offsetWidth);

    //Reposition the text
    text_element.style.left = img_left + img_width + 1 + "vmin";

}

//Function for fitting an elements text into the boundaries of its parents div
function fitText(div, text_element) {

    //Get the img_element and check if its been loaded
    const img_element = div.getElementsByTagName("img")[0];
    const img_loaded = img_element.complete && img_element.naturalHeight !== 0;

    //Position the text if the image has been loaded
    if (img_loaded)
        positionTextBasedOnAlbumWidth(img_element, text_element)
    else    //If it hasn't been loaded, add an event listener to position text once image is loaded
        img_element.addEventListener('load', function() { 
            positionTextBasedOnAlbumWidth(img_element, text_element);
        }, false);

    //First, set its fontSize to the default
        //This is so fonts can resize upward if they were made smaller but then then the window was
        //enlarged
    if (text_element.tagName == "H1")
        text_element.style.fontSize = DEFAULT_H1_FONT_SIZE + "vmin";
    else if (text_element.tagName == "H2")
        text_element.style.fontSize = DEFAULT_H2_FONT_SIZE + "vmin";
    else if (text_element.tagName == "H3")
        text_element.style.fontSize = DEFAULT_H3_FONT_SIZE + "vmin";

    //Use some math to estimate what the maximum_font_size for the given textContent in the given
    //div based on the text_elements current left value would be.
    var num_of_chars = text_element.textContent.length;
    var max_width_in_pixels = div.clientWidth - pixelsToNumber(getComputedStyle(text_element).left);
    var max_character_width_in_pixels = max_width_in_pixels / num_of_chars;
    //We multiply by 0.75 at the end because this is a conservative estimate to ensure that text
    //never goes outside of the div
        //A side effect of this is that some text might end up being smaller than it needs to be
    var max_font_size = 2 * max_character_width_in_pixels * 0.75;

    //If it's current fontSize is greater than max_font_size, set it to max_font_size
    if (pixelsToNumber(getComputedStyle(text_element).fontSize) > max_font_size)
        text_element.style.fontSize = pixelsToVmin(max_font_size) + "vmin";

}

//Function for resizing all of the text in the children of the album_images div
function resizeAllText() {

    //Get the number of albums
    const num_of_albums = Object.keys(ALBUM_LIST).length;

    //Resize one div at a time, every 1 ms to ensure page responsiveness
        //A side effect of this is that the lower on the list a div is, the longer it will take to
        //resize.
            //I assume, however, that the top-most albums will be the most looked at so
            //hopefully this isn't a huge issue. It's probably possible to only resize the divs
            //that are currently visible on screen if this proves a real issue.
    var div_id = 0;
    const RESIZING_DIV_INTERVAL = setInterval(resizeText, 1);
    function resizeText() {

        //Get the current div by its album_div_id
        const div = document.getElementById("album_div_" + div_id);

        //Fit the text of the divs h1, h2, and h3 child elements
        fitText(div, div.getElementsByTagName("h1")[0]);
        fitText(div, div.getElementsByTagName("h2")[0]);
        fitText(div, div.getElementsByTagName("h3")[0]);

        //Clear the RESIZING_DIV_INTERVAL once all elements have been resized
        if (div_id < num_of_albums - 1)
            div_id = div_id + 1;
        else    
            clearInterval(RESIZING_DIV_INTERVAL);

    }

}

//Functions for handling successes and errors of sending http requests
function xhrSuccess() { this.callback.apply(this, this.arguments); }
function xhrError() { console.error(this.statusText); }

main()