const body = document.getElementsByTagName('body')[0];
const style = document.getElementById('style');
const queued_container = document.getElementById("queued-container");
const scroll_left = document.getElementsByClassName('scroll-left')[0];
const scroll_right = document.getElementsByClassName('scroll-right')[0];
const background_image = document.getElementById('queued-background');
const background_shader = document.getElementsByClassName('background-shader')[0];
const play_pause_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" class="play-pause-svg" id="play-pause-svg"><path class="play-svg" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/><path class="pause-svg" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>';
let user_scrolled = false;

let loaded_queue = [];
let combined_songs;
let playBlock = {};
let currentSongData = {
    fileName: "",
    location: "",
};
let messageCount = 0;

let playing_song;

// function calculateColorShade(distance) {
//     distance = Math.abs(distance) / 100;
//     let min_shade = [100, 255, 150];
//     let max_shade = [255, 100, 0];
  
//     let interpolatedColor = min_shade.map((minVal, index) => {
//       return Math.round(minVal + (max_shade[index] - minVal) * distance);
//     });
    
//     return `rgb(${interpolatedColor.join(',')})`;
// }

// function setScrollbarThumbColor(color) {
//     style.innerHTML = `::-webkit-scrollbar-thumb { background-color: ${color}; }`;
// }  
  

window.addEventListener('load', () => {
    let load_page = {
        source: 'queue',
        load_page: true,
    }
    window.parent.postMessage(load_page, '*')
});

window.addEventListener('message', (event) => {
    let receivedVariable = event.data;
    if(receivedVariable.fileName !== currentSongData.fileName && receivedVariable.location !== currentSongData.location) {
        currentSongData.fileName = receivedVariable.fileName;
        currentSongData.location = receivedVariable.location;
        if(receivedVariable.hasOwnProperty('covers')) {
        if(receivedVariable.covers.hasOwnProperty('cover')){
            background_image.style.display = 'block';
            background_image.src = receivedVariable.covers.cover;
            background_shader.style.display = 'block';
            localStorage.setItem('background_image', true);
        } else if (receivedVariable.covers.hasOwnProperty('other_cover')){
            background_image.style.display = 'block';
            background_image.src = receivedVariable.covers.other_cover;
            background_shader.style.display = 'block';
            localStorage.setItem('background_image', true);
        } else if(receivedVariable.covers.hasOwnProperty('album_cover')) {
            background_image.style.display = 'block';
            background_image.src = receivedVariable.covers.album_cover;
            background_shader.style.display = 'block';
            localStorage.setItem('background_image', true);
        } else if (receivedVariable.covers.hasOwnProperty('artist_cover')){
            background_image.style.display = 'block';
            background_image.src = receivedVariable.covers.artist_cover;
            background_shader.style.display = 'block';
            localStorage.setItem('background_image', true);
        } else {
            background_image.src = '';
            background_image.style.display = 'none';
            background_shader.style.display = 'none';
            localStorage.setItem('background_image', false);
        }
        
    }
    }
    if(receivedVariable.hasOwnProperty('update') && receivedVariable.update === true){
        loaded_queue.forEach(song => {
            song.display[0].restore()
            if(song.fileName === receivedVariable.fileName && song.location === receivedVariable.location && song.index === receivedVariable.index) {
                song.display[0].update();
                if(receivedVariable.isPlaying === false){
                    song.display[0].restore();
                    user_scrolled = false;
                }
                playing_song = song.display[0];
                playing_song.scrollTo();
                if(user_scrolled === false) {
                    queued_container.scrollTo(playing_song.song_holder.offsetLeft - 40, 0);
                }
            } else {
                song.display[0].restore()
            }
        })
    } else if(receivedVariable.hasOwnProperty('priorSongs') && receivedVariable.hasOwnProperty('songsToPlay') && receivedVariable.priorSongs.length >= 0 && receivedVariable.songsToPlay.length >= 0) {
        combined_songs = [...receivedVariable.priorSongs, ...receivedVariable.songsToPlay];
        queued_container.innerHTML = ""
        loaded_queue = [];
        combined_songs.forEach(song => {
            song.playInfo = function () {
                return {
                title: this.title,
                artist: this.artist,
                fileName: this.fileName,
                location: this.location,
                covers: this.covers,
                index: this.index
                }
            }
        const isDuplicate = loaded_queue.some(existingsong => compareSongs(existingsong, song));
        if(!isDuplicate) {
            loaded_queue.push(song.playInfo())            
        }
    });
    loaded_queue.forEach(song => {
        song.playInfo = function () {
            return {
            title: this.title,
            artist: this.artist,
            fileName: this.fileName,
            location: this.location,
            covers: this.covers,
            index: this.index
            }
        }
        song.display = [];
        song.display.push(new songDivs(song));
        song.display[0].restore();
        if(song.fileName === receivedVariable.fileName && song.location === receivedVariable.location && song.index === receivedVariable.index) {
            song.display[0].update();
            if(receivedVariable.isPlaying === false){
                song.display[0].restore();
                user_scrolled = false;
            }
            playing_song = song.display[0];
            // playing_song.scrollTo();
        } else {
            song.display[0].restore();
        }
    })
    queued_container.scrollTo(playing_song.song_holder.offsetLeft - 40, 0);
    }
    if(receivedVariable.hasOwnProperty('shuffled') && receivedVariable.shuffled === true) {
        loaded_queue = [];
        queued_container.innerHTML = ""
        combined_songs = [...receivedVariable.priorSongs, ...receivedVariable.songsToPlay];

        combined_songs.forEach(song => {
            song.playInfo = function () {
                return {
                title: this.title,
                artist: this.artist,
                fileName: this.fileName,
                location: this.location,
                covers: this.covers,
                index: this.index
                }
            }
        const isDuplicate = loaded_queue.some(existingsong => compareSongs(existingsong, song));
        if(!isDuplicate) {
            loaded_queue.push(song.playInfo())            
        }
        });

        loaded_queue.forEach(song => {
            song.playInfo = function () {
                return {
                title: this.title,
                artist: this.artist,
                fileName: this.fileName,
                location: this.location,
                covers: this.covers,
                index: this.index
                }
            }
            song.display = [];
            song.display.push(new songDivs(song));
            song.display[0].restore();
            if(song.fileName === receivedVariable.fileName && song.location === receivedVariable.location && song.index === receivedVariable.index) {
                song.display[0].update();
                if(receivedVariable.isPlaying === false){
                    song.display[0].restore();
                    user_scrolled = false;
                }
                playing_song = song.display[0];
                playing_song.scrollTo();
            } else {
                song.display[0].restore();
            }
        });

    }
    //else if(receivedVariable.hasOwnProperty('fileName') && receivedVariable.hasOwnProperty('location') && receivedVariable.fileName !== "" && receivedVariable.location!== "") {
    //     loaded_queue.forEach((song) => {
    //         if(song.fileName === receivedVariable.fileName && song.location === receivedVariable.location) {
    //             song.display[0].update()
    //         } else {
    //             song.display[0].restore()
    //         }
    //     })
    // }
})

class songDivs {
    constructor (song) {
        this.song_holder = document.createElement('div');
        this.song_holder.classList.add('song-holder');

        const parser = new DOMParser();
        const svgElement = parser.parseFromString(play_pause_svg, 'image/svg+xml');
        this.svgDoc = svgElement.documentElement;
  
        this.play_svg = this.svgDoc.getElementsByClassName('play-svg')[0];
        this.pause_svg = this.svgDoc.getElementsByClassName('pause-svg')[0];

        this.cover_exists = false;

        this.song_name = document.createElement('div');
        this.song_name.classList.add('song-name');
        this.song_name_text = document.createElement('span');
        this.song_name_text.classList.add('song-name-text');
        this.song_name_text.textContent = `${song.fileName}`;

        this.play_button = document.createElement('div');
        this.play_button.classList.add('play_button');
        this.play_button.addEventListener('click',  (event) => {
            event.stopPropagation();
            playBlock.source = 'queue'
            
            let temp_ = [];
            loaded_queue.forEach(song => {
                temp_.push(song.playInfo());
            })

            playBlock.allsongs = temp_;
            playBlock.currentSong = song.playInfo();
            playBlock.playASong = true;
            window.parent.postMessage(playBlock, '*');
        });

        if(song.covers.hasOwnProperty('cover')){
            this.song_image = document.createElement('img');
            this.song_image.src = song.covers.cover;
            this.song_image.classList.add('song-image');
            this.cover_exists = true;
        } else if(song.covers.hasOwnProperty('other_cover')){
            this.song_image = document.createElement('img');
            this.song_image.src = song.covers.other_cover;
            this.song_image.classList.add('song-image');
            this.cover_exists = true;
        } else if(song.covers.hasOwnProperty('album_cover')){
            this.song_image = document.createElement('img');
            this.song_image.src = song.covers.album_cover;
            this.song_image.classList.add('song-image');
            this.cover_exists = true;
        } else if(song.covers.hasOwnProperty('artist_cover')){
            this.song_image = document.createElement('img');
            this.song_image.src = song.covers.artist_cover;
            this.song_image.classList.add('song-image');
            this.cover_exists = true;
        }

        if(this.cover_exists) {
            this.song_holder.appendChild(this.song_image);
            this.song_name.classList.add('song-name-with-image');
        }
        this.song_name.appendChild(this.song_name_text);
        this.song_holder.appendChild(this.song_name);
        this.play_button.appendChild(this.svgDoc);
        this.song_holder.appendChild(this.play_button);
        queued_container.appendChild(this.song_holder);

        this.offsetTop;
        this.offsetLeft;
    }

    update () {
        this.play_svg.style.fill = 'none';
        this.pause_svg.style.fill = 'white';
    }

    restore () {
        this.play_svg.style.fill = 'white';
        this.pause_svg.style.fill = 'none';
    }

    scrollTo (){
        if(this.song_holder.getBoundingClientRect().left >= 0 && this.song_holder.getBoundingClientRect().right <= window.innerWidth) {
            scroll_left.style.display = 'none';
            scroll_right.style.display = 'none';
            // this.song_holder.style.position = '';
            // this.song_holder.style.left = '0';
            // this.song_holder.style.top = `${this.offsetTop}px`;
        }
        if(this.song_holder.getBoundingClientRect().left < 0) {
            // this.offsetTop = this.song_holder.offsetTop;
            // this.song_holder.style.position = 'fixed';
            // this.song_holder.style.left = '150px';
            // this.song_holder.style.top = '25%'
            scroll_left.style.display = 'block';
        }
        if(this.song_holder.getBoundingClientRect().right > window.innerWidth) {
            scroll_right.style.display = 'block';
            // this.song_holder.style.position = 'fixed';
            // this.song_holder.style.left = '150px';
            // this.song_holder.style.top = '25%'
        }
        
        this.scroll_distance_percentage = (this.song_holder.getBoundingClientRect().left / queued_container.scrollWidth) * 100;
        // setScrollbarThumbColor(calculateColorShade(this.scroll_distance_percentage));
    }
}

function compareSongs(obj1, obj2) {
    return obj1.filename === obj2.filename && obj1.location === obj2.location && obj1.index === obj2.index;
}

queued_container.addEventListener('wheel', (event) => {
    event.preventDefault();
    queued_container.scrollLeft += event.deltaY;
    user_scrolled = true;
    // playing_song.scrollTo();
});

queued_container.addEventListener('scroll', (event) => {
    playing_song.scrollTo();
});

queued_container.addEventListener('seeking', (event) => {
    playing_song.scrollTo();
});

scroll_left.addEventListener('click', (event) => {
    queued_container.scrollTo(playing_song.song_holder.offsetLeft - 40, 0);
    user_scrolled = false;
});

scroll_right.addEventListener('click', (event) => {
    queued_container.scrollTo(playing_song.song_holder.offsetLeft -40, 0);
    user_scrolled = false;
});