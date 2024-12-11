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

function openWindowWithSize(url) {
    const width = Math.round(window.innerWidth * 0.7);
    const height = Math.round(window.innerHeight * 0.7);
    const left = Math.round((window.innerWidth - width) / 2);
    const top = Math.round((window.innerHeight - height) / 2);
    window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top}`);
}

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
        
        <!-- Adding text content -->
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
		
        ipren: `<h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">Ipren Campaign</h2><p>Details...</p>
<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px;">
            <img src="images/treo/treo-tidning-png-2.png" 
                 alt="Spotify Image 1" 
                 style="width: calc(25% - 10px); border-radius: 5px;">
            <img src="images/treo/treo-tidning-png-4.png" 
                 alt="Spotify Image 2" 
                 style="width: calc(25% - 10px); border-radius: 5px;">
         
        </div>
`,
        diablo: `<div id="diablo" onclick="cycleDiabloContent()"> this project was a tribue to the badassness of cultures worldwide. flip through the pitch by clicking on the text 
    
</div>

<div id="diablo-insight" style="display: none;">
    <!-- Content will be dynamically added here -->
</div>
 
    
   




    `,
        f16: `<h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">F-16 Jet Campaign</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur scelerisque ipsum dolor, vel luctus risus luctus sit amet. Pellentesque scelerisque gravida diam. Curabitur vitae risus sit amet justo scelerisque tempor. Phasellus </p>`,
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

`


,
        kalles: `<h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">Kalles Kaviar Campaign</h2><p>Details...</p>`,
      europa: `<div style="font-size: 16px; font-family: 'Suisse', 'sans-serif'; text-transform: lowercase; color: black; line-height: 1.5;">
    <div id="europa-quote" onclick="fetchAndDisplayEuropaQuotation();" style="cursor: pointer;">
        Click the box to flip through some of the work.
    </div>
    <div>
        <p> This is some samples from an exhibit I made with the founder of Kesselskramer, Erik Kessels. It was called Europa Archive and I wrote most of the stuff. Check out the full exhibit here. <br>
            <a href="https://europearchive.eu/country-index/" target="_blank">https://europearchive.eu/country-index/</a>
        </p>
    </div>

</div>

`,


        ikea: `<h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">Ikea Campaign</h2><p>Details...</p>`,
        ecb: `<h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">ECB Campaign</h2><p>Details...</p>`,
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
        banned: `<h2 style="font-size: 16px; font-family: 'Suisse', 'sans-serif';">Banned Songs</h2><p>Details...</p>`,
        kindle: `
            
<div id="quotation" onclick="fetchAndDisplayQuotation();">
    this little eulogy for my broken kindle is built on whatever annotations i was able to salvage. start by clicking the box
</div>
        `,
        amazonCrime: `
    <div style="font-size: 16px; font-family: 'Suisse', 'sans-serif'; text-transform: lowercase; color: black; line-height: 1.5;">
        <p>this was really made  for my friends, but yea,  this tool downloads a movie from my collection, hehehe</p>
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
                `,
		
    };

    const displayArea = document.getElementById('content-display');
    const mediaArea = document.getElementById('media');

    if (content[section]) {
        displayArea.innerHTML = content[section];

        // Adjust layout to make the content area occupy 70%
        mediaArea.style.flex = '0 0 50%';
        mediaArea.style.width = '50%';
    } else {
        displayArea.innerHTML = '<p>No content available.</p>';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    initializeEuropaQuote();
});

let initialLoadEuropa = true;

function initializeEuropaQuote() {
    const europaQuoteElement = document.getElementById('europa-quote');
    if (initialLoadEuropa && europaQuoteElement) {
        europaQuoteElement.textContent =
            "This is some samples from an exhibit I made with the founder of Kesselskramer, Erik Kessels. It was called Europa Archive and I wrote most of the stuff. Click the box to flip through some of the work.";
    }
}

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

            if (!text) {
                europaQuoteElement.textContent = "Failed to load the Europa Archive. Please try again.";
                return;
            }

            const entries = text.split(/\n\s*\n/);

            // Attempt to find a valid entry
            let validEntry = null;
            for (let i = 0; i < entries.length; i++) {
                const randomIndex = Math.floor(Math.random() * entries.length);
                const randomEntry = entries[randomIndex];

                const match = randomEntry.match(/^(\d+)\.(.*?)\n([\s\S]+)/);
                if (match) {
                    validEntry = {
                        number: match[1],
                        title: match[2].trim(),
                        description: match[3].trim(),
                    };
                    break; // Exit the loop if a valid entry is found
                }
            }

            if (validEntry) {
                europaQuoteElement.innerHTML = `
                    <div style="margin-bottom: 10px; font-weight: bold;">${validEntry.number}. ${validEntry.title}</div>
                    <div>${validEntry.description}</div>
                `;
            } else {
                europaQuoteElement.textContent =
                    "No valid entries found. Please try again.";
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            const europaQuoteElement = document.getElementById('europa-quote');
            europaQuoteElement.textContent = "Error fetching content. Please try again later.";
        });
}




let initialLoad = true;
const imageMap = {
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



function fetchAndDisplayQuotation() {
    fetch('texter/annotations.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            const quotations = text.split(/\n\s*\n/);
            const quotationElement = document.getElementById('quotation');
            const imageElement = document.getElementById('quotation-image');

            if (initialLoad) {
                initialLoad = false; // Prevent resetting the initial text
            } else {
                const randomQuotation = quotations[Math.floor(Math.random() * quotations.length)];
                const match = randomQuotation.match(/^(\d+)\.(.*?)\n([\s\S]+)/);

                if (match) {
                    const number = parseInt(match[1], 10);
                    const title = match[2].trim();
                    const description = match[3].trim();

                    // Update the text content
                    quotationElement.innerHTML = `
                        <div style="margin-bottom: 10px; font-weight: bold;">${number}. ${title}</div>
                        <div>${description}</div>
                    `;

                    // Debug image path
                    if (imageMap[number]) {
                        const imagePath = imageMap[number];
                        console.log(`Loading image: ${imagePath}`);
                        imageElement.src = imagePath;
                        imageElement.alt = `${title} (${number})`;
                        imageElement.style.display = "block"; // Show the image
                    } else {
                        console.warn(`No image found for entry ${number}`);
                        imageElement.style.display = "none"; // Hide the image
                    }
                } else {
                    console.error("Could not parse the selected entry:", randomQuotation);
                    quotationElement.textContent = "Could not parse the selected entry. Please try again.";
                    imageElement.style.display = "none";
                }
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            const quotationElement = document.getElementById('quotation');
            const imageElement = document.getElementById('quotation-image');

            quotationElement.textContent = "Error fetching content. Please try again later.";
            imageElement.style.display = "none";
        });
}


function loadGround5Content() {
    const iframe = document.getElementById('ground5-iframe');

    // Check if the iframe exists
    if (iframe) {
        // Set the iframe source to ground5.html
        iframe.src = 'ground6.html';

        // Make the iframe visible
        iframe.style.display = 'block';
    } else {
        console.error('Iframe element not found.');
    }
}


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
                const maximumRuntime = 97;

                const shortMovies = movies.filter(movie => {
                    if (movie.Runtime && movie.Year > 1945) {
                        const runtime = parseInt(movie.Runtime.split(' ')[0]);
                        return runtime <= maximumRuntime;
                    }
                    return false;
                });

                displayMovie(shortMovies);
            }

            function findMovie() {
                const year = parseFloat(document.getElementById('yearInput').value);
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
                            const movieId = data.results[0].id;
                            callback(movieId);
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
                        if (data.poster_path) {
                            callback(data.poster_path);
                        } else {
                            callback(null);
                        }
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
                    .catch(error => console.error('Error fetching movie credits: ' + movieId, error));
            }

            function displayMovieCredits(credits) {
                const director = credits.crew.find(member => member.job === 'Director');
                const actors = credits.cast.slice(0, 5);
                const movieCreditsElement = document.getElementById('movieCredits');
                movieCreditsElement.innerHTML = '';

                if (director) {
                    const directorUrl = `https://www.themoviedb.org/person/${director.id}`;
                    movieCreditsElement.innerHTML += `<p>Director: <a href="${directorUrl}" target="_blank">${director.name}</a></p>`;
                } else {
                    movieCreditsElement.innerHTML += '<p>Director information not available.</p>';
                }

                if (actors.length > 0) {
                    let actorsHTML = '<p>Actors: ';
                    actors.forEach((actor, index) => {
                        const actorUrl = `https://www.themoviedb.org/person/${actor.id}`;
                        actorsHTML += `<a href="${actorUrl}" target="_blank">${actor.name}</a>`;
                        if (index < actors.length - 1) {
                            actorsHTML += ', ';
                        }
                    });
                    actorsHTML += '</p>';
                    movieCreditsElement.innerHTML += actorsHTML;
                } else {
                    movieCreditsElement.innerHTML += '<p>Actor information not available.</p>';
                }
            }

            window.findMovie = findMovie;
            window.find90MinuteMovies = find90MinuteMovies;
        })
        .catch(error => console.error('Error loading movie data: ', error));
}

const diabloTexts = [
    `<strong>Brief:</strong>
    Create a launch campaign that breaks through culture in a way unique to Diablo.`,
    
    `<strong>Background:</strong>
    Diablo is set in an underworld inspired by Hell.`,
	
	`<strong>Background:</strong>
    An underworld like our "hell" is not a concept unique to the West, and neither is being scared shitless by it.
  `,
    
   ` <strong>Background:</strong>
    Across the world, we’ve been gearing up for one final quest through the kingdom of death.<strong>`,
 
		`<strong>Background:</strong>
		Packing our coffins with badass shit like: spellbooks, weapons, maps, and coins   <img src="images/Diablo/SKELETT_25fps_output.gif" alt="Diablo Skeleton Animation" width="50%"> 

 ` ,
    
	
    `<strong>Unique Insight:</strong>
    Turns out that some of the demon slaying gear has made its way back to the living. `,
	
	
    `<strong>Unique Insight:</strong>
     In museums around the world it lies. <strong> thirsting for the foul taste of demon blood once more. 
</div>
</strong>`,
    
	`<strong>Solution:</strong> 
let’s Gear 4 Hell by looting and wielding the same gear used by our ancestors when slaying demons in the afterlife
  ` ,
    
     `<strong>Media:   <img src="./images/Diablo/Render.gif" alt="Render Gif" style="width:100%; "> </strong>
   `,
    `<strong>Media:   <img src="./images/Diablo/korea.gif" alt="Korea Gif" style="width:100%;">   "> </strong>`,
];
// Content for the #diablo-insight box
const diabloInsightContent = `
<sup>1</sup>For instance, in ancient Greece, it was customary to place a coin in or on the mouth of the deceased as payment for 
    <a href="https://en.wikipedia.org/wiki/Charon%27s_obol" target="_blank">Charon</a>, the ferryman who transported souls across the river dividing the living from the dead. 

<sup>2</sup>Similarly, ancient Egyptians included the 
    <a href="https://en.wikipedia.org/wiki/Book_of_the_Dead" target="_blank">Book of the Dead</a>, a collection of spells intended to guide and protect the deceased in the afterlife, within their burial practices. 

<sup>3</sup>In Norse traditions, Vikings honored their dead by burying them with grave goods such as weapons, jewelry, and tools, reflecting their status and beliefs. Notably, some Viking burials included <a href="https://en.wikipedia.org/wiki/Norse_funeral" target="_blank">ship burials</a>, where the deceased were placed in boats along with their possessions, symbolizing their journey to the afterlife. 

<sup>4</sup>Likewise, in ancient China, it was common to include 
    <a href="https://en.wikipedia.org/wiki/Mingqi" target="_blank">mingqi</a>, or "spirit goods," in burials. 
    These items ranged from everyday objects to elaborate models of servants and animals, intended to serve and accompany the deceased in the afterlife.`;



// Index for cycling through diabloTexts
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
    // Check for "Solution:" trigger
    else if (currentText.includes('Solution:')) {
        diabloInsightElement.style.display = 'block';
        diabloInsightElement.innerHTML = 'check out the case film:<a href="https://www.youtube.com/watch?v=qxbl1RnUT-c&modestbranding=1&rel=0" target="_blank">https://www.youtube.com/watch?v=qxbl1RnUT-c</a> <img src="images/Diablo/texturer/animated_frames.gif" alt="Diablo Animation" style="height: 16px;">';
    } else {
        diabloInsightElement.style.display = 'none';
    }

    // Increment and loop the index
    diabloIndex = (diabloIndex + 1) % diabloTexts.length;
}
