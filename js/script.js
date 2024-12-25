// Script initialization
console.log('Script loaded!');

// Constants
const DISCOGS_API_URL = "https://api.discogs.com/database/search";
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const DISCOGS_HEADERS = {
    "User-Agent": "YourAppName/1.0",
    "Authorization": "Discogs token=dOqLEzunKNWwkBaWDdxTyzjIoTrLfczHQjMZCsZj"
};
const YOUTUBE_API_KEY = 'AIzaSyCXlfQ3WZ7eI-Tr61gDpeu7ZIcMN7hUo40';

// Fetch a random song from a specific year
async function getRandomSongFromYear(year) {
    console.log('Fetching random song for year:', year);
    const params = new URLSearchParams({
        year: year,
        type: "release",
        page: 1,
        per_page: 100
    });

    try {
        const response = await fetch(`${DISCOGS_API_URL}?${params}`, { headers: DISCOGS_HEADERS });
        if (!response.ok) throw new Error(`Failed to fetch songs for year ${year}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            console.log('No songs found for year:', year);
            return null;
        }

        const randomSong = data.results[Math.floor(Math.random() * data.results.length)].title;
        console.log('Random song fetched:', randomSong);
        return randomSong;
    } catch (error) {
        console.error('Error fetching random song:', error);
        return null;
    }
}

// Fetch a YouTube video ID for a given song title
async function getYoutubeVideo(songTitle) {
    console.log('Searching YouTube for song:', songTitle);
    const params = new URLSearchParams({
        q: songTitle,
        part: 'snippet',
        maxResults: 1,
        key: YOUTUBE_API_KEY,
        type: 'video'
    });

    try {
        const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
        if (!response.ok) throw new Error(`YouTube search failed for song: ${songTitle}`);
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.log('No YouTube video found for song:', songTitle);
            return null;
        }

        const videoId = data.items[0].id.videoId;
        console.log('YouTube video ID:', videoId);
        return videoId;
    } catch (error) {
        console.error('Error fetching YouTube video:', error);
        return null;
    }
}

// Fetch and display a song and its video for a given birth year
async function fetchSongAndVideo() {
    console.log('Fetching song and video for the selected birth year.');
    const birthdateElement = document.getElementById("birthdate");
    if (!birthdateElement) {
        console.error('Birthdate input element not found.');
        return;
    }

    const birthdate = new Date(birthdateElement.value);
    const year = birthdate.getFullYear();

    const song = await getRandomSongFromYear(year);
    const songTitleElement = document.getElementById("songTitle");
    const youtubeEmbedElement = document.getElementById("youtubeEmbed");

    if (song) {
        songTitleElement.textContent = song;
        const videoId = await getYoutubeVideo(song);
        if (videoId) {
            youtubeEmbedElement.src = `https://www.youtube.com/embed/${videoId}`;
        } else {
            youtubeEmbedElement.src = "";
        }
    } else {
        songTitleElement.textContent = "No song found!";
        youtubeEmbedElement.src = "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const dynamicHeader = document.getElementById("dynamic-header");
    const contentDisplay = document.getElementById("content-display");
    const mediaArea = document.getElementById("media");
    
    const projectPaths = {
        ikea: "/elias/portfolio/2011/ikea",
        ipren: "/elias/portfolio/2011/ipren",
        spotify: "/elias/portfolio/2011/spotify",
        diablo: "/elias/portfolio/2011/diablo",
        f16: "/elias/portfolio/2011/f16",
        groundnews: "/elias/portfolio/2011/groundnews",
        kalles: "/elias/portfolio/2011/kalles",
        europa: "/elias/portfolio/2011/europa",
        ecb: "/elias/portfolio/2011/ecb",
        birthday: "/elias/portfolio/2011/birthday",
        banned: "/elias/portfolio/2011/banned",
        kindle: "/elias/portfolio/2011/kindle",
        amazonCrime: "/elias/portfolio/2011/amazonCrime"
    };
	
	
    // Initialize with default text (no links)
    dynamicHeader.textContent = '/elias/'; // Change this to whatever you prefer as the default

	
    
    // Function to show content and update the dynamic header
    function showContent(section) {
        const content = {
            spotify: `
                <div style="position: absolute; top: 0; width: 100%; height: auto; overflow: hidden; padding: 10px;">
                    <!-- Updated iframe -->
                    <iframe src="https://www.youtube.com/embed/Fi_V9lzc5BE" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen 
                            style="width: 100%; height: 300px; border-radius: 5px;"></iframe>
                    
                    <!-- Adding images -->
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px;">
                        <img src="images/Spotify/spoinsta.png" 
                             alt="Spotify Image 1" 
                             style="width: calc(25% - 10px); border-radius: 5px;">
                        <img src="images/Spotify/spotooh1.png" 
                             alt="Spotify Image 2" 
                             style="width: calc(25% - 10px); border-radius: 5px;">
                        <img src="images/Spotify/spotooh2.png" 
                             alt="Spotify Image 3" 
                             style="width: calc(25% - 10px); border-radius: 5px;">
                        <img src="images/Spotify/spotooh3.png" 
                             alt="Spotify Image 4" 
                             style="width: calc(25% - 10px); border-radius: 5px;">
                    </div>



                    <div style="margin-top: 20px; font-size: 16px; font-family: 'Suisse', 'sans-serif'; color: black; line-height: 1.5;">
                        <h3 style="text-transform: lowercase;">Brief:</h3>
                        <p>Market audiobooks to young adults and teenagers.</p>

                        <h3 style="text-transform: lowercase;">Background:</h3>
                        <p>96% of young adults use a smart device in their last hour awake, and 70% of them use audio as a sleep aid. And while falling asleep to an audiobook seems ideal, it actually sucks because you never know when you fell asleep.</p>

                        <h3 style="text-transform: lowercase;">Unexpected Insight:</h3>
                        <p>Sleep trackers can use the smartphone accelerometer to pinpoint the moment you sleep.</p>

                        <h3 style="text-transform: lowercase;">Solution:</h3>
                        <p>Audiobooks that pause when you sleep.</p>
                    </div>
                </div>
            `,
            ipren: `
                <h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">Ipren Campaign</h2>
                <p>Details...</p>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px;">
                    <img src="images/treo/treo-tidning-png-2.png" 
                         alt="Spotify Image 1" 
                         style="width: calc(25% - 10px); border-radius: 5px;">
                    <img src="images/treo/treo-tidning-png-4.png" 
                         alt="Spotify Image 2" 
                         style="width: calc(25% - 10px); border-radius: 5px;">
                </div>
            `,
            diablo: `

<div id="diablo" onclick="cycleDiabloContent()">
   <strong> click the text to flip through the pitch or check the case below </strong>
    <a href="#" onclick="openPopup('https://www.youtube.com/embed/qxbl1RnUT-c?modestbranding=1&rel=0&autoplay=0'); return false;">https://www.youtube.com/watch?v=qxbl1RnUT-c</a>
    <div class="animation-container">
        <img src="images/Diablo/animation.gif" alt="Diablo Animation" class="animated-gif">
    </div>
</div>






                <div id="diablo-insight" style="display: none;">

                    <!-- Content will be dynamically added here -->
               
            `,
            f16: `
                <h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">F-16 Jet Campaign</h2>
                
▀████▀                             ▀███████████████████████████████████████████▀█████▄▄▄▄▄▀ ░▓█▀  ░░      ███████████████████████████████████████████████████      ▄██████  ▓  ▀  ▒▒      ▄███████████████████████████████████████████                     ▄█████▄████████  ▒▐▌█▐▌▓▓
██████   ▐█████████  ░▐▌▓▐▌██
▄████▄   ███▄▄▀▄▄██   ▐▌▒▐▌██ ▄▄▄▄▄▄▄                  ▄▄▄▄█████▄
        ▐███▀▀▀▀▀██   ▐▌░▐▌██ █▄██████████████████▄ ▄▄███████████ █▐█████░░ 
        ▐██████████   ▐▌ ▐▌██ ███████ ▄▄     ▄▄████  ▀▀▀▀      ▀▀ ▓▐█████▓▓░
   ▄▄  ▀▐██▀▀▀▀▀▀▀█░ ░▐▌░▐▌██ ▓█▀▀▀▀█ █▓  ▄▄█   ▌▄▐               ░▐███████▒
   █▄███▐██ █▀▀▀█ █▒ ▒▐▌▒▐▌██ ░█ ██ █ ▓░     ▄▄█▌█▐                ▐██████▀▓
    ▀█  ▐██ ▌▐▀▌▐ █▓ ▓▐▌▓▐▌██ ▄█▄▄▄▄█ ░   ▄▄█   ▌▓▐    ▀███████▀    ▌▀▀▀▀▀▀▀
   ▄▄ █▄ ██ █▄▄▄█ ██ ▓▐▌░▐▌██ ███████  ░     ▄▄█▌░▐░   █████████    ▌      ▐
   █▄██▀ ▐█▄▄▄▄▄▄▄██▌█▐▌▓▐▌██ ▓▓▓▓▓▓▓ ░▒  ▀▀█   ▌█▐▒   █████████    ▌      ▐
    ▀█    ▀██████████▄  ▀  ██ ▒▒▒▒▒▒▒ ▒▓     ▄▄█▌▀▐▓   ▄███████▄   ░▌ ■    ▐
   ▄▄ █▄    ▀▀█████████▄▄▄▄██ ░▓░▓░▓░ ▓▀  ▄▄█   ████               ▒▌    ▐▄▐
   █▄██▀░  ░   ▀▀▀███████████ ███████ █▄     ▄▄█████▄▄█ ▄          ▓▌▀ █▄  ▐
    ▀█  ▒░ ▒  ░ ░  ▀▀▀▀▀▀███▀           ▄█████████▀▄▀▀ ▀▀         ■   ▄▄  ▄▄ ▄
   ▄▄ █▄▓▒░▓░░▓░▓░▒        ▀▀           ▀▀▀▀▀▀▀▀▀▀█▀███▄ ■         ▄▄ ▀▀▀▄▀▀
   █▄██▀█▓▒█▒▓█▓█▓▓░                        ▀▀ ■█▄▄█ ▄█▀           ▄▄▄▀▀▀█▄▒▄▄
    ▀█  ██▓█▓██████▓    ▀███████████████▀    ▄▄  ▀ ██ ▀ ▄          ▀▀▀███■█ ▀▀
     ███████████▓░██    █████████████████                          ██▄ ▄█ ▀▄ ▀
     ▀█   ██████████    █████████████████                  ▀███▀    ▀  ▀█▀   ■
                        ▄███████████████▄                  ▄███▄            
                              ▀
                           ▄            ▓        ▄▄▄▀▀▀▀▀▀▀▀▀▀▄▄
                            █▀▀▀▀▄▄     ▄     ▄▀▀ ▄▄▄▓██████▓▄▄ ▀▄
                            █ ▀█▄▄ ▀█▀▀▀▓▀▀▀█▀ ▄█████▀▀▀▀▀▀▀███▓▄ ▓
         ▄▄█▀▀▀▀▀▀▀▀▄▄     ▐▌░▓████▄ ▀▄ ▀ ▄▀ ▄▓█▀▀ ▄▄▄▓████▄ ▀███▌▐▌
      ▄▀▀ ▄▄▄▓████▓▄▄ ▀▄   ▓ ▐███▌▀██▄ ▀▄▐▌ ██▀ ▄██████████▓ ▐████ █
    ▄▀ ▄▓████▀▀▀▀████▓▄ █ ▐▌ ▓███ ▄ ▀█▓▄ █ ▓█▌ ▓████████▀▀▀ ▄████▓ █  ▀
  ▄▀ ▄▓██▀▀ ▄▄█▓▄▄ ▀███▌▐██ ▐███▌▐█▓ ▐██▌ ▐██▌ █████████ ▀▀▓█████▌ █  ▄
▄▀ ▄████▌ ▄▓█████▀▄ ▐███ ▐▌ ▓███ ███▌ ███  ███▄ ▀▓████████▄▄▄ ▀▀▀ ▐▌  ▀
▓▀▄ ▀████ ████▓▀▄██ ▐███ ▓ ▐███▌▐███▓ ▐██▌  ▀▓██▄▄ ▀▀▀▓████████▀█▀▀▄▄▄▓▄▄ ▄▄  ▄
▀ ▐▓ ▐███▌▐█▓▀▄██▓▀ ███▌▐▌ ████ ▀▓███▌ ██▓ ▓▄ ▀▀▓████▄▄▄▄▄▄▄▄ ▀▀▀▀▓▄▄ █ rl!/gen
▄  █▌ ▓███ ▀▄█▓▀▀ ▄██▓▀ ▓ ▐███▌▐█▄▀██▓ ▐██▌▐██▀   ▀▀▀▀▀▀▀▓███████▄▄ ▀▀█▄
   ▐█ ▐███▌  ▄▄▄████▀  ▀▌ ▓███ ▓██▓▄▀█▌ ██▓ ▓▌ ▄▓███▀ ▓█▄▄▄▄▄▄ ▀▀▀▓██▄▄ ▀▄▄
    ▓▌ ▓███████▓▀▀  ▄▄█▓ ▐███▌▄█████▓▄▀ ▐██▌▐ ▐████ ▄██████████▓▀▄▄ ▀███▄ ▀▓▄
    ▐█ ▐███▌  ▄▄▄▓██▀██▌ ████▄▄ ▀▀█████▌ ██▓  ████▌▐██████████▀▄▓███▄ ▀██▓▄ ▀▓
     ▓▌ ▓█████▀▀▀ ▄ ▐█▓ ▐███▌▀▀██▄▄ ▀▀█▓ ▐██▌ ▓███▌▐███████▓▀▄███████▓ ▐███▌ ▐▓
     ▐█ ▐███▌ ▄▓██▌ ██▌ ████  ■▄ ▀▀▓█▄▄ ▀ ███ ▐████ ██████▀▄██████████▌ ███▓  █▌      ▓▌ ▓███ ▐███ ▐█▓ ▀▀▓████▄ ▀▓▄▄ ▀▀▓█▄▄██▌ ████▓ ▀▓█▀▄▓██████████▓ ▐███▌ ▐▓
      ▐█ ▐██▓▄ ██▄ ▀▀▀▀ ▄▄ ▀▀▓██▄▄ ▀█▓▄▄ ▀▀▓██  ▓████▄  ▓██████████▓▀ ▄██▓▀ ▄▓▒
      ▓  ▀▀▀ ▄▄▓▀▀▀▀▀▀▀▀▓▀▀▀▄ ▀█▀ ▄▀   ▀▀▓▄▄▄ ▀  ▀████▓▄▄ ▀▀▓███▀▀ ▄▄███▀ ▄█▀ ░
      ▀▀▀▀▀▀▀▀          ▒    ▀▄ ▄▀          ▀▀▀▀▀▄▄ ▀▀█████▄▄▄▄▄▄████▓▀ ▄▓▀
                        ░      ▀                   ▀▀▄▄ ▀▀▀▓█████▓▀▀ ▄▄█▀
                                                       ▀▀▀▄▄▄▄▄▄▄▄▄▀▀▀

            `,
            groundnews: `
                <div style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">
                    <!-- Add iframe container -->
                    <div id="iframe-container" style="margin-top: 20px; width: 90%; height: 700px; overflow: hidden;">
                        <!-- Iframe directly displaying the ground6.html content -->
                        <iframe id="ground5-iframe" src="ground6.html" style="width: 100%; height: 100%; border: none;"></iframe>
                    </div>

                    <br>
                    <br>

                    <div style="text-align: center;">
                        <p style="font-family: 'Suisse', 'sans-serif'; color: white; line-height: 1.5; background-color: black; display: inline-block; padding: 1px; font-weight: bold;">
                            do you feel lost in this year's election cycle?
                        </p>
                        <p style="font-family: 'Suisse', 'sans-serif'; color: black; line-height: 1.5; font-size: 12px; font-weight: normal;">
                            Ground News helps you break free from algorithms <br>by comparing the whole spectrum of news sources.
                        </p>
                    </div>

                    <div id="iframe-container" style="margin-top: 20px; width: 90%; height: 700px; overflow: hidden;">
                        <!-- Iframe directly displaying the ground1.html content -->
                        <iframe id="ground1-iframe" src="ground1.html" style="width: 100%; height: 100%; border: none;"></iframe>
                    </div>

                    <br>
                    <br>

                    <div style="text-align: center;">
                        <p style="font-family: 'Suisse', 'sans-serif'; color: white; line-height: 1.5; background-color: black; display: inline-block; padding: 1px; font-weight: bold;">
                            do you feel lost in this year's election cycle?
                        </p>
                        <p style="font-family: 'Suisse', 'sans-serif'; color: black; line-height: 1.5; font-size: 12px; font-weight: normal;">
                            Ground News helps you break free from algorithms <br>by comparing the whole spectrum of news sources.
                        </p>
                    </div>
                </div>
            `,
            kalles: `
               <pre>

<span style="font-weight:bold;color:dimgray;background-color:lime;">▀</span><span style="color:lime;">████</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▀</span><span style="color:red;">  </span><span style="color:white;"></span><span style="font-weight:bold;color:dimgray;background-color:lime;">▀</span><span style="color:lime;">███████████████████████████████████████████</span><span style="font-weight:bold;color:dimgray;">
</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▀</span><span style="color:lime;">██████</span><span style="color:white;"></span><span style="font-weight:bold;color:dimgray;">▄</span><span style="font-weight:bold;color:yellow;">▄▄</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;">▄▄</span><span style="color:red;background-color:fuchsia;">▀</span><span style="color:red;background-color:black;"> </span><span style="font-weight:bold;color:red;background-color:red;">░▓</span><span style="font-weight:bold;color:red;background-color:black;">█</span><span style="font-weight:bold;color:dimgray;background-color:white;">▀</span>  <span style="font-weight:bold;color:yellow;">░░</span><span style="color:lime;">███████████████████████████████████████████████████</span><span style="color:white;"></span><span style="font-weight:bold;color:yellow;">▄██████</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;"> </span><span style="color:red;"> ▓</span><span style="color:white;">  </span><span style="font-weight:bold;color:red;background-color:red;">▀</span>  <span style="font-weight:bold;color:yellow;">▒▒</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▄</span><span style="color:lime;">███████████████████████████████████████████</span><span style="font-weight:bold;color:dimgray;">
</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▄</span><span style="color:lime;">██████</span><span style="color:white;"></span><span style="font-weight:bold;color:yellow;">▄████████</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;"> </span><span style="color:red;"> ▒</span><span style="font-weight:bold;color:white;">▐▌</span><span style="color:red;background-color:fuchsia;">█</span><span style="font-weight:bold;color:white;background-color:black;">▐▌</span><span style="font-weight:bold;color:yellow;background-color:black;">▓▓</span>
<span style="color:lime;">██████</span><span style="color:white;"></span><span style="font-weight:bold;color:yellow;">▐█████████</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;"> </span><span style="color:red;"> ░</span><span style="font-weight:bold;color:white;">▐▌</span><span style="color:red;">▓</span><span style="font-weight:bold;color:white;">▐▌</span><span style="font-weight:bold;color:yellow;background-color:white;">██</span>
<span style="font-weight:bold;color:dimgray;background-color:lime;">▄</span><span style="color:lime;">████</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▄</span>   <span style="font-weight:bold;color:yellow;">███</span>▄<span style="font-weight:bold;background-color:white;">▄</span>▀<span style="font-weight:bold;background-color:white;">▄</span>▄<span style="font-weight:bold;color:yellow;">██</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;"> </span> <span style="color:red;"> </span><span style="font-weight:bold;color:white;">▐▌</span><span style="color:red;">▒</span><span style="font-weight:bold;color:white;">▐▌</span><span style="font-weight:bold;color:yellow;background-color:white;">██</span> <span style="color:#3333FF;">▄</span><span style="font-weight:bold;color:#3333FF;">▄▄▄▄</span><span style="color:#3333FF;">▄▄</span><span style="color:white;">▄</span><span style="font-weight:bold;color:yellow;">▄</span><span style="font-weight:bold;color:yellow;background-color:white;">▄▄</span><span style="font-weight:bold;color:yellow;background-color:black;">█████</span><span style="font-weight:bold;color:yellow;background-color:white;">▄</span>
 ▐<span style="font-weight:bold;color:yellow;">███</span>▀<span style="font-weight:bold;background-color:white;">▀▀▀</span>▀<span style="font-weight:bold;color:yellow;">██</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;"> </span>  <span style="font-weight:bold;">▐▌</span><span style="color:red;">░</span><span style="font-weight:bold;color:white;">▐▌</span><span style="font-weight:bold;color:yellow;background-color:white;">█</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span> <span style="font-weight:bold;color:#3333FF;">█</span><span style="font-weight:bold;color:white;background-color:white;">▄█████</span><span style="font-weight:bold;color:yellow;background-color:black;">███████████</span><span style="font-weight:bold;color:white;background-color:white;">██▄</span> ▄<span style="font-weight:bold;color:yellow;background-color:white;">▄</span><span style="font-weight:bold;color:yellow;background-color:black;">███████████</span> █<span style="font-weight:bold;color:yellow;">▐███</span>██<span style="font-weight:bold;">░░</span><span style="color:fuchsia;"> </span><span style="color:white;">
</span><span style="font-weight:bold;color:yellow;">▐██████████</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;"> </span>  <span style="font-weight:bold;">▐▌</span> <span style="font-weight:bold;">▐▌</span><span style="font-weight:bold;color:yellow;background-color:white;">█</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span> <span style="font-weight:bold;color:#3333FF;">█</span><span style="font-weight:bold;color:yellow;">██████</span> <span style="font-weight:bold;color:#3333FF;">▄▄</span><span style="font-weight:bold;color:#3333FF;background-color:#3333FF;">▄▄</span><span style="color:#3333FF;">█</span><span style="font-weight:bold;color:yellow;">███</span> <span style="font-weight:bold;color:yellow;background-color:white;"> ▀</span><span style="font-weight:bold;color:yellow;background-color:black;">▀</span>▀▀▀▀ ▓<span style="font-weight:bold;color:yellow;">▐█████</span><span style="font-weight:bold;color:white;">▓▓</span><span style="color:red;">░</span><span style="color:white;">
</span><span style="font-weight:bold;color:dimgray;">▄▄</span> <span style="font-weight:bold;color:yellow;background-color:white;"> </span><span style="font-weight:bold;color:dimgray;background-color:white;">▀</span><span style="font-weight:bold;color:yellow;background-color:black;">▐██▀</span><span style="font-weight:bold;color:yellow;background-color:white;">▀▀▀▀▀</span><span style="font-weight:bold;color:yellow;background-color:black;">▀█</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;">░</span> <span style="color:fuchsia;">░</span><span style="font-weight:bold;color:white;">▐▌</span>░<span style="font-weight:bold;">▐▌</span><span style="font-weight:bold;color:yellow;background-color:white;">█</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span> <span style="font-weight:bold;color:#3333FF;">▓</span><span style="font-weight:bold;color:yellow;">█▀</span><span style="font-weight:bold;color:yellow;background-color:white;">▀▀</span><span style="font-weight:bold;color:yellow;background-color:black;">▀█</span> █<span style="font-weight:bold;color:#3333FF;">▓</span>  <span style="font-weight:bold;color:yellow;background-color:yellow;">▄▄</span><span style="color:yellow;">█</span><span style="color:white;"></span><span style="font-weight:bold;color:yellow;">▌</span><span style="color:red;">▄</span><span style="font-weight:bold;color:yellow;">▐</span>░<span style="font-weight:bold;color:yellow;">▐█████</span><span style="font-weight:bold;color:white;">██</span><span style="color:red;">▒</span><span style="color:white;">
</span><span style="font-weight:bold;color:dimgray;">█</span><span style="font-weight:bold;color:yellow;background-color:white;">▄</span><span style="font-weight:bold;color:yellow;background-color:black;">██</span>█<span style="font-weight:bold;color:yellow;">▐██</span><span style="font-weight:bold;color:yellow;background-color:white;"> </span><span style="font-weight:bold;color:white;background-color:black;">█▀▀▀█</span><span style="font-weight:bold;color:yellow;background-color:white;"> </span><span style="font-weight:bold;color:yellow;background-color:black;">█</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;">▒</span> <span style="color:fuchsia;">▒</span><span style="font-weight:bold;color:white;">▐▌</span>▒<span style="font-weight:bold;">▐▌</span><span style="font-weight:bold;color:yellow;background-color:white;">█</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span> <span style="font-weight:bold;color:#3333FF;">░</span><span style="font-weight:bold;color:yellow;">█</span><span style="font-weight:bold;color:yellow;background-color:white;"> </span><span style="font-weight:bold;color:white;background-color:black;">██</span><span style="font-weight:bold;color:yellow;background-color:white;"> </span><span style="font-weight:bold;color:yellow;background-color:black;">█</span> ▓<span style="font-weight:bold;color:#3333FF;">░</span><span style="font-weight:bold;color:red;background-color:red;">▄▄</span><span style="color:red;">█</span><span style="font-weight:bold;color:yellow;">▌</span><span style="color:yellow;">█</span><span style="font-weight:bold;color:yellow;">▐</span><span style="font-weight:bold;color:yellow;"> ▐█████</span><span style="font-weight:bold;color:white;">█</span><span style="font-weight:bold;color:white;background-color:white;">▀</span><span style="color:red;">▓</span><span style="color:white;">
</span><span style="font-weight:bold;color:yellow;background-color:white;">▀</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span>  <span style="font-weight:bold;color:yellow;">▐██</span><span style="font-weight:bold;color:yellow;background-color:white;"> </span><span style="font-weight:bold;color:white;background-color:black;">▌▐▀▌▐</span><span style="font-weight:bold;color:yellow;background-color:white;"> </span><span style="font-weight:bold;color:yellow;background-color:black;">█</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;">▓</span> <span style="color:fuchsia;">▓</span><span style="font-weight:bold;color:white;">▐▌</span>▓<span style="font-weight:bold;">▐▌</span><span style="font-weight:bold;color:yellow;background-color:white;">█</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span> <span style="font-weight:bold;color:dimgray;">▄</span><span style="font-weight:bold;color:yellow;">█▄</span><span style="font-weight:bold;color:yellow;background-color:white;">▄▄</span><span style="font-weight:bold;color:yellow;background-color:black;">▄█</span> ░<span style="font-weight:bold;color:#3333FF;"> </span>  <span style="font-weight:bold;color:lime;background-color:lime;">▄▄</span><span style="color:lime;">█</span><span style="color:white;"></span><span style="font-weight:bold;color:yellow;">▌</span><span style="color:yellow;background-color:white;">▓</span><span style="font-weight:bold;color:yellow;background-color:black;">▐</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▀</span><span style="color:lime;">███████</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▀</span>  <span style="font-weight:bold;color:yellow;">  </span><span style="color:fuchsia;">▌▀▀▀▀▀▀</span><span style="color:red;">▀</span><span style="color:white;">
</span><span style="font-weight:bold;color:dimgray;">▄▄</span> <span style="font-weight:bold;color:yellow;">█</span><span style="font-weight:bold;color:yellow;background-color:white;">▄</span><span style="font-weight:bold;color:dimgray;background-color:black;"> </span><span style="font-weight:bold;color:yellow;background-color:black;">██</span><span style="font-weight:bold;color:yellow;background-color:white;"> </span><span style="font-weight:bold;color:white;background-color:black;">█▄▄▄█</span><span style="font-weight:bold;color:yellow;background-color:white;"> </span><span style="font-weight:bold;color:yellow;background-color:black;">█</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;">█</span> <span style="font-weight:bold;color:#3333FF;">▓</span><span style="font-weight:bold;color:white;">▐▌</span><span style="font-weight:bold;color:#3333FF;background-color:white;">░</span><span style="font-weight:bold;color:white;background-color:black;">▐▌</span><span style="font-weight:bold;color:yellow;background-color:white;">█</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span> <span style="font-weight:bold;color:yellow;">███████</span> <span style="font-weight:bold;color:#3333FF;"> ░</span><span style="font-weight:bold;background-color:white;">▄▄</span>█<span style="font-weight:bold;color:yellow;">▌</span><span style="background-color:yellow;">░</span><span style="font-weight:bold;color:yellow;background-color:black;">▐</span><span style="color:yellow;">░</span><span style="color:white;"></span><span style="color:lime;">█████████</span><span style="color:white;"></span><span style="color:fuchsia;">▌</span><span style="color:#3333FF;">      </span><span style="color:fuchsia;">▐</span><span style="color:white;">
</span><span style="font-weight:bold;color:dimgray;">█</span><span style="font-weight:bold;color:yellow;background-color:white;">▄</span><span style="font-weight:bold;color:yellow;background-color:black;">██</span><span style="font-weight:bold;color:yellow;background-color:white;">▀</span> <span style="font-weight:bold;color:yellow;">▐█▄</span><span style="font-weight:bold;color:yellow;background-color:white;">▄▄▄▄▄</span><span style="font-weight:bold;color:yellow;background-color:black;">▄█</span><span style="font-weight:bold;color:yellow;background-color:fuchsia;">█</span>▌<span style="font-weight:bold;color:#3333FF;background-color:#3333FF;">█</span><span style="font-weight:bold;color:white;background-color:black;">▐▌</span><span style="font-weight:bold;color:#3333FF;background-color:white;">▓</span><span style="font-weight:bold;color:white;background-color:black;">▐▌</span><span style="font-weight:bold;color:yellow;background-color:white;">█</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span> <span style="font-weight:bold;color:yellow;">▓▓▓▓▓▓▓</span><span style="font-weight:bold;color:white;"> </span><span style="font-weight:bold;color:#3333FF;">░▒</span>  <span style="font-weight:bold;color:dimgray;background-color:white;">▀▀</span><span style="font-weight:bold;color:dimgray;background-color:black;">█</span><span style="font-weight:bold;color:yellow;">▌</span><span style="color:yellow;">█</span><span style="font-weight:bold;color:yellow;">▐</span><span style="color:yellow;">▒</span><span style="color:white;"></span><span style="color:lime;">█████████</span><span style="color:white;"></span><span style="color:fuchsia;">▌</span><span style="color:#3333FF;">      </span><span style="color:fuchsia;">▐</span><span style="color:white;">
</span><span style="font-weight:bold;color:yellow;background-color:white;">▀</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span><span style="font-weight:bold;color:yellow;">▀██████████▄</span>  <span style="font-weight:bold;color:#3333FF;background-color:#3333FF;">▀</span>  <span style="font-weight:bold;color:yellow;background-color:white;">█</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span> <span style="font-weight:bold;">▒▒▒▒▒▒▒ </span><span style="font-weight:bold;color:#3333FF;">▒▓</span><span style="font-weight:bold;color:fuchsia;background-color:fuchsia;">▄▄</span><span style="color:fuchsia;">█</span><span style="font-weight:bold;color:yellow;">▌</span><span style="color:red;">▀</span><span style="font-weight:bold;color:yellow;">▐</span><span style="color:yellow;">▓</span><span style="color:white;"></span><span style="font-weight:bold;color:dimgray;background-color:lime;">▄</span><span style="color:lime;">███████</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▄</span><span style="color:fuchsia;">░▌</span><span style="color:aqua;"> ■</span><span style="color:white;"></span><span style="color:fuchsia;">▐</span><span style="color:white;">
</span><span style="font-weight:bold;color:dimgray;">▄▄</span> <span style="font-weight:bold;color:yellow;">█</span><span style="font-weight:bold;color:yellow;background-color:white;">▄</span><span style="font-weight:bold;color:yellow;">▀</span><span style="font-weight:bold;color:white;background-color:white;">▀</span><span style="font-weight:bold;color:white;background-color:black;">█</span><span style="font-weight:bold;color:yellow;background-color:black;">████████</span><span style="font-weight:bold;color:yellow;background-color:white;">▄</span><span style="font-weight:bold;color:yellow;background-color:black;">▄▄</span><span style="font-weight:bold;color:yellow;background-color:white;">▄</span><span style="font-weight:bold;color:yellow;background-color:black;">██</span> <span style="color:dimgray;background-color:white;">░</span><span style="color:white;background-color:black;">▓</span><span style="color:dimgray;background-color:white;">░</span><span style="color:white;background-color:black;">▓</span><span style="color:dimgray;background-color:white;">░</span><span style="color:white;background-color:black;">▓</span><span style="color:dimgray;background-color:white;">░</span><span style="color:white;background-color:black;"> </span><span style="font-weight:bold;color:#3333FF;background-color:black;">▓</span><span style="font-weight:bold;color:#3333FF;background-color:white;">▀</span>  <span style="font-weight:bold;color:aqua;background-color:aqua;">▄▄</span><span style="color:aqua;">█   </span><span style="font-weight:bold;color:yellow;">███</span><span style="color:yellow;">█</span><span style="color:white;"></span><span style="color:fuchsia;">▒▌</span><span style="color:white;"></span><span style="color:aqua;">▐▄</span><span style="color:fuchsia;">▐</span><span style="color:white;">
</span><span style="font-weight:bold;color:dimgray;">█</span><span style="font-weight:bold;color:yellow;background-color:white;">▄</span><span style="font-weight:bold;color:yellow;background-color:black;">██</span><span style="font-weight:bold;color:yellow;background-color:white;">▀</span><span style="color:yellow;">░</span><span style="color:white;">  </span><span style="color:yellow;">░</span><span style="color:white;"> </span><span style="color:red;"> </span><span style="color:white;"> </span><span style="font-weight:bold;color:yellow;">▀▀</span><span style="font-weight:bold;color:white;background-color:white;">▀</span><span style="font-weight:bold;color:white;background-color:black;">█</span><span style="font-weight:bold;color:yellow;background-color:black;">██████████</span> <span style="font-weight:bold;color:dimgray;">███████ </span><span style="font-weight:bold;color:#3333FF;">█</span><span style="font-weight:bold;color:#3333FF;background-color:white;">▄</span> <span style="font-weight:bold;color:yellow;"> </span><span style="font-weight:bold;color:#3333FF;background-color:#3333FF;">▄▄</span><span style="color:#3333FF;">█</span><span style="font-weight:bold;color:white;">███</span><span style="color:yellow;">█</span><span style="color:red;">▄</span><span style="font-weight:bold;color:red;background-color:red;">▄</span><span style="color:red;">█</span><span style="color:white;"> </span><span style="color:red;">▄</span><span style="color:white;"></span><span style="color:fuchsia;">▓▌</span><span style="color:aqua;">▀</span><span style="color:white;"> </span><span style="font-weight:bold;color:aqua;background-color:aqua;">█▄</span>  <span style="color:fuchsia;">▐</span><span style="color:white;">
</span><span style="font-weight:bold;color:yellow;background-color:white;">▀</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span>  <span style="color:yellow;">▒</span><span style="color:fuchsia;">░</span><span style="color:white;"> </span><span style="color:yellow;">▒</span><span style="color:white;"> </span><span style="color:red;"> </span><span style="color:yellow;">░</span><span style="color:white;"> </span><span style="color:red;">░</span><span style="color:white;">  ▀</span><span style="font-weight:bold;color:yellow;">▀▀▀</span><span style="font-weight:bold;color:yellow;background-color:white;">▀▀</span><span style="font-weight:bold;color:yellow;background-color:black;">███</span><span style="font-weight:bold;color:yellow;background-color:white;">▀</span><span style="color:red;"> </span><span style="color:white;"></span><span style="color:red;">▄</span><span style="font-weight:bold;color:yellow;">███</span><span style="font-weight:bold;color:yellow;background-color:yellow;">████</span><span style="font-weight:bold;color:white;background-color:black;">██</span><span style="font-weight:bold;color:white;background-color:white;">▀</span><span style="color:red;background-color:yellow;">▄</span><span style="color:red;background-color:black;">▀▀</span><span style="color:white;background-color:black;"> </span><span style="color:red;background-color:black;">▀▀</span><span style="color:white;background-color:black;"></span><span style="color:aqua;background-color:black;">■</span><span style="color:fuchsia;background-color:black;">  </span><span style="color:white;background-color:black;"> </span><span style="color:aqua;background-color:black;">▄▄</span><span style="color:white;background-color:black;">  </span><span style="color:aqua;background-color:black;">▄</span><span style="font-weight:bold;color:dimgray;background-color:black;">▄</span><span style="color:aqua;"> ▄</span><span style="color:white;">
</span><span style="font-weight:bold;color:dimgray;">▄▄</span> <span style="font-weight:bold;color:yellow;">█</span><span style="font-weight:bold;color:yellow;background-color:white;">▄</span><span style="color:yellow;">▓</span><span style="color:fuchsia;">▒</span><span style="color:red;">░</span><span style="color:yellow;">▓</span><span style="color:fuchsia;">░</span><span style="color:red;">░</span><span style="color:yellow;">▓</span><span style="color:fuchsia;">░</span><span style="color:red;">▓</span><span style="color:yellow;">░</span><span style="font-weight:bold;color:yellow;">▒</span><span style="font-weight:bold;color:dimgray;"> </span>     <span style="font-weight:bold;color:#3333FF;">  </span><span style="font-weight:bold;color:dimgray;">▀▀</span><span style="font-weight:bold;color:#3333FF;"> </span><span style="color:red;">▀</span><span style="color:yellow;">▀▀▀▀▀▀▀▀▀</span><span style="color:red;">█▀█</span><span style="font-weight:bold;color:red;background-color:red;">██</span><span style="color:red;">▄ ■</span><span style="color:white;"></span><span style="color:aqua;">▄</span><span style="font-weight:bold;color:aqua;background-color:aqua;">▄</span> <span style="color:aqua;">▀</span><span style="font-weight:bold;color:aqua;background-color:aqua;">▀</span><span style="color:aqua;">▀▄</span><span style="font-weight:bold;color:aqua;background-color:aqua;">▀</span><span style="color:aqua;">▀</span><span style="color:white;">
</span><span style="font-weight:bold;color:dimgray;">█</span><span style="font-weight:bold;color:yellow;background-color:white;">▄</span><span style="font-weight:bold;color:yellow;background-color:black;">██</span><span style="font-weight:bold;color:yellow;background-color:white;">▀</span><span style="color:yellow;">█</span><span style="color:fuchsia;">▓</span><span style="color:red;">▒</span><span style="color:yellow;">█</span><span style="color:fuchsia;">▒</span><span style="color:red;">▓</span><span style="color:yellow;">█</span><span style="color:fuchsia;">▓</span><span style="color:red;">█</span><span style="color:yellow;">▓</span><span style="font-weight:bold;color:yellow;">▓</span><span style="font-weight:bold;color:dimgray;">░</span> <span style="font-weight:bold;color:dimgray;"> </span>          <span style="color:red;">▀▀</span><span style="color:white;"> </span><span style="color:dimgray;background-color:red;">■</span><span style="color:red;background-color:black;">█▄</span><span style="font-weight:bold;color:red;background-color:red;">▄</span><span style="color:red;">█</span><span style="color:white;"> </span><span style="color:red;">▄█▀</span><span style="color:white;"></span><span style="font-weight:bold;color:dimgray;">▄</span><span style="color:aqua;">▄▄</span><span style="font-weight:bold;color:dimgray;background-color:aqua;">▀</span><span style="color:aqua;">▀</span><span style="font-weight:bold;color:aqua;background-color:aqua;">▀</span><span style="color:aqua;">█</span><span style="font-weight:bold;color:dimgray;">▄</span><span style="font-weight:bold;color:aqua;">▒</span><span style="font-weight:bold;color:aqua;background-color:aqua;">▄</span><span style="color:aqua;">▄</span><span style="color:white;">
</span><span style="font-weight:bold;color:yellow;background-color:white;">▀</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span>  <span style="color:yellow;">█</span><span style="color:fuchsia;">█</span><span style="color:red;">▓</span><span style="color:yellow;">█</span><span style="color:fuchsia;">▓</span><span style="color:red;">█</span><span style="color:yellow;">█</span><span style="color:fuchsia;">█</span><span style="color:red;">█</span><span style="color:yellow;">█</span><span style="font-weight:bold;color:yellow;">█</span><span style="font-weight:bold;color:dimgray;">▓</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▀</span><span style="color:lime;">███████████████</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▀</span><span style="font-weight:bold;color:red;background-color:red;">▄</span><span style="color:red;">▄</span><span style="color:white;">  </span><span style="color:red;">▀</span><span style="color:white;"> </span><span style="color:red;">██</span><span style="color:white;"> </span><span style="color:red;">▀</span><span style="color:white;"> </span><span style="color:red;">▄</span><span style="color:white;"></span><span style="color:aqua;">▀▀</span><span style="font-weight:bold;color:aqua;background-color:aqua;">▀</span><span style="font-weight:bold;color:aqua;background-color:black;">█</span><span style="font-weight:bold;color:aqua;background-color:aqua;">█</span><span style="color:aqua;">█</span><span style="color:dimgray;background-color:aqua;">■</span><span style="color:aqua;background-color:black;">█</span><span style="color:fuchsia;background-color:black;"> </span><span style="color:aqua;background-color:black;">▀</span><span style="font-weight:bold;color:dimgray;background-color:black;">▀</span>
<span style="font-weight:bold;color:yellow;">███████████▓░█</span><span style="font-weight:bold;color:dimgray;">█</span><span style="font-weight:bold;color:yellow;">   </span> <span style="color:lime;">█████████████████</span><span style="color:white;"></span><span style="font-weight:bold;color:aqua;">██</span><span style="color:aqua;">▄</span><span style="font-weight:bold;color:dimgray;"> </span><span style="color:aqua;">▄█ </span><span style="font-weight:bold;color:aqua;background-color:aqua;">▀</span><span style="font-weight:bold;color:dimgray;background-color:aqua;">▄</span> <span style="color:aqua;">▀</span><span style="color:white;">
</span><span style="font-weight:bold;color:yellow;"> </span><span style="font-weight:bold;color:yellow;background-color:white;">▀</span><span style="font-weight:bold;color:yellow;background-color:black;">█</span><span style="font-weight:bold;color:#3333FF;background-color:black;">  </span><span style="font-weight:bold;color:yellow;background-color:black;"> </span><span style="font-weight:bold;color:dimgray;background-color:black;">██████████</span><span style="color:lime;">█████████████████</span><span style="color:white;"></span><span style="font-weight:bold;color:dimgray;background-color:lime;">▀</span><span style="color:lime;">███</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▀</span><span style="color:aqua;">▀  </span><span style="font-weight:bold;color:dimgray;">▀</span><span style="font-weight:bold;color:aqua;">█</span><span style="font-weight:bold;color:aqua;background-color:aqua;">▀</span><span style="color:aqua;">■</span><span style="color:white;">
</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▄</span><span style="color:lime;">███████████████</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▄</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▄</span><span style="color:lime;">███</span><span style="font-weight:bold;color:dimgray;background-color:lime;">▄</span><span style="color:aqua;">    </span><span style="color:white;">  </span><span style="color:aqua;">   </span><span style="color:white;">
</span></pre>

            `,
            europa: `
                    <div id="europa-quote" onclick="fetchAndDisplayEuropaQuotation();" style="cursor: pointer;">
                        Click the box to flip through some of the work.
                    </div>
                  
              
<div>
                        <p>This is some samples from an exhibit I made with the founder of Kesselskramer, Erik Kessels. It was called Europa Archive and I wrote most of the stuff. Check out the full exhibit here. <br>
                            <a href="https://europearchive.eu/country-index/" target="_blank">https://europearchive.eu/country-index/</a>
                        </p>
                    </div>   
            `,
            ikea: `
                <h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">Ikea Campaign</h2>
                <p>Details...</p>
            `,
            ecb: `
                <h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">ECB Campaign</h2>
                <p>Details...</p>
            `,
            birthday: `
                <div style="padding: 2px; font-size: 16px; font-family: 'Suisse', 'sans-serif'; text-transform: lowercase; color: black; line-height: 1.5;">
                    Just like people, songs are born every day, <br> this song is from the day you were born.

                    <form onsubmit="event.preventDefault(); fetchSongAndVideo();" style="margin-bottom: 20px;">
                        <input type="date" id="birthdate" name="birthdate" required style="background-color: #000000; color: white; padding: 5px 5px; border: 1px solid white; cursor: pointer; margin-right: 10px;">
                        <button type="submit" style="background-color: #000000; color: white; padding: 5px 5px; border: 1px solid white; cursor: pointer;">Get Your Birthday Song</button>
                    </form>
                    <h2 id="songTitle" style="margin-top: 20px;"></h2>
                    <iframe id="youtubeEmbed" width="100%" height="315" src="" frameborder="0" allowfullscreen style="border-radius: 10px;"></iframe>
                </div>
            `,
            banned: `
                <h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">Banned Songs</h2>
                <p>Details...</p>
            `,
            kindle: `
                <div id="quotation" onclick="fetchAndDisplayQuotation();">
              this is a eulogy for my dead Kindle, composed of random, out-of-context fragments salvaged from its drive. click to flip through.






            `,
            amazonCrime: `
                <div style="font-size: 16px; font-family: 'Suisse', 'sans-serif'; text-transform: lowercase; color: black; line-height: 1.5;">
                    <p>this was really made for my friends, but yea, this tool downloads a movie from my collection, hehehe</p>
                    <div style="display: flex; align-items: center; gap: 2px; margin-bottom: 20px;">
                        <form onsubmit="event.preventDefault(); findMovie();" style="display: flex; align-items: center; gap: 2px;">
                            <input type="number" id="yearInput" min="1919" max="2023" value="1988" required style="background-color: #000000; color: white; padding: 5px; border: 1px solid white; cursor: pointer;">
                            <button type="submit" style="background-color: #000000; color: white; padding: 5px; border: 1px solid white; cursor: pointer;">Find Movie</button>
                        </form>
                        <form onsubmit="event.preventDefault(); find90MinuteMovies();" style="display: inline;">
                            <button type="submit" style="background-color: #000000; color: white; padding: 5px; border: 1px solid white; cursor: pointer;">Give me a 90 minuter</button>
                        </form>
                    </div>
                    <p id="movieLink"></p>
                    <div id="movieCredits"></div>
                </div>
            `
        };

        // Update content display area
        if (content[section]) {
            contentDisplay.innerHTML = content[section];
            mediaArea.style.flex = "0 0 50%"; 
            mediaArea.style.width = "50%"; 
        } else {
            contentDisplay.innerHTML = "<p>No content available.</p>"; 
        }

        // Update dynamic header with project path if section exists
      if (projectPaths[section]) {
    dynamicHeader.innerHTML = `${projectPaths[section]}`;
} else {
    dynamicHeader.innerHTML = ''; // Clear the header if there's no section
}
    }

    // Expose showContent globally so it can be called from HTML
    window.showContent = showContent;

    // Additional function to open a new window
    function openWindowWithSize(url) {
        const width = Math.round(window.innerWidth * 0.7);
        const height = Math.round(window.innerHeight * 0.7);
        const left = Math.round((window.innerWidth - width) / 2);
        const top = Math.round((window.innerHeight - height) / 2);
        window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top}`);
    }

    // Initialize the Europa Quote
    initializeEuropaQuote();
});
function openPopup(url) {
    const width = 800; // Width of the popup window
    const height = 450; // Height of the popup window
    const left = (screen.width - width) / 2; // Center the popup horizontally
    const top = (screen.height - height) / 2; // Center the popup vertically

    // Open a popup window
    const popupWindow = window.open(
        url,
        '_blank',
        `width=${width},height=${height},top=${top},left=${left},resizable=no,scrollbars=no`
    );

    // Bring the popup window into focus
    if (popupWindow) {
        popupWindow.focus();
    } else {
        alert('Popup blocked! Please enable popups for this website.');
    }
}
// Global variables for loading
let initialLoadEuropa = true;
let initialLoad = true;

// Function to initialize the Europa content
function initializeEuropaQuote() {
    const europaQuoteElement = document.getElementById('europa-quote');
    if (initialLoadEuropa && europaQuoteElement) {
        europaQuoteElement.textContent =
            "This is some samples from an exhibit I made with the founder of Kesselskramer, Erik Kessels. It was called Europa Archive and I wrote most of the stuff. Click the box to flip through some of the work.";
    }
}
const europaImages = {
    155: "images/europa/155.collection photo manuals_austria.gif",
    157: "images/europa/157.cut-out incomplete album page_germany.gif",
    165: "images/europa/165.fieldpost 1940_austria.gif",
    167: "images/europa/167.framed photographic model study_germany.gif",
    168: "images/europa/168.gdr mini book_germany.gif",
    174: "images/europa/174.horserider on matchbox_austria.gif",
    176: "images/europa/176.hotel stickers vezprem_hungary.gif",
    177: "images/europa/177.illustrated magazine_greece.gif",
    184: "images/europa/184.matchsticks with women and advertising_france.gif",
    206: "images/europa/206.trenchart vase_france.gif",
    211: "images/europa/211.waterfall postcards_france.gif",
    222: "images/europa/222.a doghouse and two dags as bottles_austria.gif",
    226: "images/europa/226.early dartboard_holland.gif",
    232: "images/europa/232.personal company mug_romania.gif",
    284: "images/europa/284.two tiny sexy magazines_germany.jpg",
    407: "images/europa/407.box with pencils_austria.JPG",
    408: "images/europa/408.early flipbook_austria.JPG",
    409: "images/europa/409.stereo image woman doing her business_austria.JPG",
    414: "images/europa/414.photo in frame with glass pieces_hungary.JPG",
    416: "images/europa/416.photo for gravestone_hungary.JPG",
    442: "images/europa/442.collection of polish beer labels_poland.gif",
    453: "images/europa/453.bag with travel documents_belgium.gif",
    458: "images/europa/458.book on fire brigade_germany.gif",
    472: "images/europa/472.round box out of cigarette packages_germany.gif",
    482: "images/europa/482.group photo gymnastic team_the netherlands.gif"
};

function fetchAndDisplayEuropaQuotation() {
    fetch('json/europa.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            const europaQuoteElement = document.getElementById('europa-quote');
            const entries = text.split(/\n\s*\n/); // Split text into entries by double line breaks
            const randomIndex = Math.floor(Math.random() * entries.length);
            const selectedEntry = entries[randomIndex].trim();

            // Extract the ID from the entry text (even if it's wrapped in <strong>)
            const entryIdMatch = selectedEntry.match(/<strong>(\d+)\./); // Match IDs like "176." within <strong> tags
            const entryId = entryIdMatch ? entryIdMatch[1] : null;

            // Check if there's a corresponding image for the ID
            if (entryId && europaImages[entryId]) {
                europaQuoteElement.innerHTML = `
                    <div>
                        <img src="${europaImages[entryId]}" alt="Europa Image ${entryId}" style="max-width: 100%; height: auto; margin-bottom: 10px;">
                        <p>${selectedEntry}</p>
                    </div>
                `;
            } else {
                // If no image exists, just display the text
                europaQuoteElement.innerHTML = selectedEntry;
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

// Function to fetch and display quotations
function fetchAndDisplayQuotation() {
    fetch('texter/annotations.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            console.log('Fetched Text:', text);

            // Split entries by blank lines (double line breaks) and filter out entries with 3 words or less
            const quotations = text
                .split(/\n\s*\n/) // Split into entries by blank lines
                .map(entry => entry.trim()) // Trim extra whitespace
                .filter(entry => entry.split(/\s+/).length > 3); // Filter entries with more than 3 words
            
            console.log('Filtered Quotations:', quotations);

            const quotationElement = document.getElementById('quotation');

            if (!quotationElement) {
                console.error('Quotation element not found in the DOM.');
                return;
            }

            if (quotations.length === 0) {
                // Handle the case where all entries are skipped
                console.warn('No valid quotations available.');
                quotationElement.innerHTML = `
                    <div style="color: red;">
                        No valid quotations to display. Please check the text file.
                    </div>
                `;
                return;
            }

            // Select a random entry
            const randomQuotation = quotations[Math.floor(Math.random() * quotations.length)];
            console.log('Selected Quotation:', randomQuotation);

            // Update the quotation element
            quotationElement.innerHTML = `
                <div>${randomQuotation}</div>
            `;
        })
        .catch(error => {
            console.error('Fetch error:', error);

            const quotationElement = document.getElementById('quotation');
            if (quotationElement) {
                quotationElement.innerHTML = `
                    <div style="color: red;">
                        Could not load quotations. Please try again.
                    </div>
                `;
            }
        });
}



// Function to load Ground 5 content
function loadGround5Content() {
    const iframe = document.getElementById('ground5-iframe');
    if (iframe) {
        iframe.src = 'ground6.html';
        iframe.style.display = 'block';
    } else {
        console.error('Iframe element not found.');
    }
}
function loadConverted10111111Content() {
    const iframe = document.getElementById('ground5-iframe');
    if (iframe) {
        iframe.src = 'converted-10111111.html'; // Ensure this file is in the correct location
        iframe.style.display = 'block';
    } else {
        console.error('Iframe element not found. Make sure the iframe with id "ground5-iframe" exists.');
    }
}





// Load Amazon Crime Functionality
function loadAmazonCrimeFunctionality() {
    fetch('texter/movies.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(movies => {
            function find90MinuteMovies() {
                const shortMovies = movies.filter(movie => {
                    const runtime = parseInt(movie.Runtime.split(' ')[0]);
                    return movie.Runtime && movie.Year > 1945 && runtime <= 97;
                });
                displayMovie(shortMovies);
            }

            function findMovie() {
                const year = parseInt(document.getElementById('yearInput').value);
                const moviesFromYear = movies.filter(movie => movie.Year === year);
                displayMovie(moviesFromYear);
            }

            function displayMovie(movieList) {
                const movieElement = document.getElementById('movieLink');
                movieElement.innerHTML = '';

                if (movieList.length > 0) {
                    const selectedMovie = movieList[Math.floor(Math.random() * movieList.length)];

                    searchTmdbForMovieId(selectedMovie.Title, selectedMovie.Year, (movieId) => {
                        fetchTmdbMovieDetails(movieId, (imageUrl) => {
                            const movieElementWithPoster = createMovieElement(selectedMovie, imageUrl);
                            movieElement.appendChild(movieElementWithPoster);

                            getMovieCredits(movieId, (credits) => {
                                displayMovieCredits(credits);
                            });
                        });
                    });
                } else {
                    movieElement.textContent = 'No movie found for that year.';
                }
            }

            function createMovieElement(selectedMovie, posterPath) {
                const defaultImageUrl = 'Bilder/poster.png';
                const imageUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : defaultImageUrl;
                const movieInfoHTML = `
                    <p>${selectedMovie.Title} | Runtime: ${selectedMovie.Runtime} | <a href="${selectedMovie.Link}" target="_blank" onclick="openWindowWithSize('${selectedMovie.Link}')">Link</a> | Password: elias</p>
                `;

                const movieElement = document.createElement('div');
                movieElement.classList.add('movie-element');
                movieElement.innerHTML = `
                    <div class="movie-info">${movieInfoHTML}</div>
                    <div class="movie-poster">
                        <img src="${imageUrl}" alt="${selectedMovie.Title} Poster" style="max-width:100%;height:auto;">
                    </div>
                `;
                return movieElement;
            }

            function searchTmdbForMovieId(title, year, callback) {
                const apiKey = '400455f56b3e2b3e009287db19785e09';
                const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}`;

                fetch(searchUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results && data.results.length > 0) {
                            callback(data.results[0].id);
                        } else {
                            console.error(`No TMDB entry found for: ${title} (${year})`);
                        }
                    })
                    .catch(error => {
                        console.error(`Error searching TMDB for movie: ${title} (${year})`, error);
                    });
            }

            function fetchTmdbMovieDetails(movieId, callback) {
                const apiKey = '400455f56b3e2b3e009287db19785e09';
                const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;

                fetch(detailsUrl)
                    .then(response => response.json())
                    .then(data => {
                        callback(data.poster_path || null);
                    })
                    .catch(error => {
                        console.error(`Error fetching TMDB details for movie ID: ${movieId}`, error);
                        callback(null);
                    });
            }

            function getMovieCredits(movieId, callback) {
                const apiKey = '400455f56b3e2b3e009287db19785e09';
                const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;

                fetch(url)
                    .then(response => response.json())
                    .then(data => callback(data))
                    .catch(error => console.error(`Error fetching movie credits for movie ID: ${movieId}`, error));
            }

            function displayMovieCredits(credits) {
                const movieCreditsElement = document.getElementById('movieCredits');
                movieCreditsElement.innerHTML = '';

                const director = credits.crew.find(member => member.job === 'Director');
                if (director) {
                    movieCreditsElement.innerHTML += `<p>Director: <a href="https://www.themoviedb.org/person/${director.id}" target="_blank">${director.name}</a></p>`;
                } else {
                    movieCreditsElement.innerHTML += '<p>Director information not available.</p>';
                }

                const actors = credits.cast.slice(0, 5);
                if (actors.length > 0) {
                    movieCreditsElement.innerHTML += '<p>Actors: ' + actors.map(actor => `<a href="https://www.themoviedb.org/person/${actor.id}" target="_blank">${actor.name}</a>`).join(', ') + '</p>';
                } else {
                    movieCreditsElement.innerHTML += '<p>Actor information not available.</p>';
                }
            }

            window.findMovie = findMovie;
            window.find90MinuteMovies = find90MinuteMovies;
        })
        .catch(error => console.error('Error loading movie data: ', error));
}

// Texts and insights for Diablo
const diabloTexts = [
    `<strong>Brief:</strong> <br> Create a launch campaign that breaks through culture in a way unique to Diablo.`,
    `<strong>Background:</strong> <br>Diablo is set in an underworld inspired by Hell.`,
    `<strong>Background:</strong><br> An underworld like our "hell" is not a concept unique to the West, and neither is being scared shitless by it.`,
    `<strong>Background:</strong> <br>Across the world, we’ve been gearing up for one final quest through the kingdom of death.`,
    `<strong>Background:</strong><br> Packing our coffins with badass shit like: spellbooks, weapons, maps, and coins `,
    `<strong>Unique Insight:</strong><br> Turns out that some of the demon slaying gear has made its way back to the living.`,
    `<strong>Unique Insight:</strong> <br>In museums around the world it lies. Thirsting for the foul taste of demon blood once more.`,
    `<strong>Solution:</strong> <br>Let’s Gear 4 Hell by looting and wielding the same gear used by our ancestors when slaying demons in the afterlife.`,
    ` <img src="./images/Diablo/Render.gif" alt="Render Gif" style="width:100%;"> <img src="./images/Diablo/korea.gif" alt="Korea Gif" style="width:100%;"> <img src="images/Diablo/SKELETT_25fps_output.gif" alt="Diablo Skeleton Animation" width="50%"> `,
    
];

const diabloInsightContent = `
<sup>1</sup>For instance, in ancient Greece, it was customary to place a coin in or on the mouth of the deceased as payment for <a href="https://en.wikipedia.org/wiki/Charon%27s_obol" target="_blank">Charon</a>, the ferryman who transported souls across the river dividing the living from the dead.<br>
<sup>2</sup>Similarly, ancient Egyptians included the <a href="https://en.wikipedia.org/wiki/Book_of_the_Dead" target="_blank">Book of the Dead</a>, a collection of spells intended to guide and protect the deceased in the afterlife, within their burial practices.<br>
<sup>3</sup>In Norse traditions, Vikings honored their dead by burying them with grave goods such as weapons, jewelry, and tools, reflecting their status and beliefs. Notably, some Viking burials included <a href="https://en.wikipedia.org/wiki/Norse_funeral" target="_blank">ship burials</a>, where the deceased were placed in boats along with their possessions, symbolizing their journey to the afterlife.<br>
<sup>4</sup>Likewise, in ancient China, it was common to include <a href="https://en.wikipedia.org/wiki/Mingqi" target="_blank">mingqi</a>, or "spirit goods," in burials. These items ranged from everyday objects to elaborate models of servants and animals, intended to serve and accompany the deceased in the afterlife.`;

// Cycling through diablo texts
let diabloIndex = 0;
function cycleDiabloContent() {
    const diabloElement = document.getElementById('diablo');
    const diabloInsightElement = document.getElementById('diablo-insight');

    if (!diabloElement || !diabloInsightElement) {
        console.error('Required elements not found.');
        return;
    }

    // Update #diablo content
    const currentText = diabloTexts[diabloIndex];
    diabloElement.innerHTML = currentText;

    // Show diablo-insight for specific text conditions
    if (currentText.includes('Across the world, we’ve been gearing up for one final quest through the kingdom of death')) {
        diabloInsightElement.style.display = 'block';
        diabloInsightElement.innerHTML = diabloInsightContent;
    } 
   else if (currentText.includes('Solution:')) {
    diabloInsightElement.style.display = 'block';
    diabloInsightElement.innerHTML = `
        check out the case film:
        <a href="#" onclick="openPopup('https://www.youtube.com/embed/qxbl1RnUT-c?modestbranding=1&rel=0&autoplay=0'); return false;">https://www.youtube.com/watch?v=qxbl1RnUT-c</a>
        <img src="images/Diablo/texturer/animated_frames.gif" alt="Diablo Animation" style="height: 16px;">
    `;
} else {
    diabloInsightElement.style.display = 'none';
}
    // Increment and loop the index
    diabloIndex = (diabloIndex + 1) % diabloTexts.length;
}

