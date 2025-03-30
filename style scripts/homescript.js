const home_body = document.getElementById('home-body');
const home_nav = document.getElementsByClassName('home-nav')[0];
const home_nav_underline = document.getElementsByClassName('home-nav-underline')[0];
const home_nav_radio = document.getElementsByClassName('home-nav-list');
const home_nav_radio_label = document.getElementsByClassName('home-nav-label');
const iframe = document.getElementById('home-pages');
const sliderBall = document.getElementsByClassName('slider-ball')[0];
const sliderLabel = document.getElementById('song-slider-label');
const songSlider = document.getElementById('song-slider');
const overlay = document.createElement('div');
const play_pause_button = document.getElementsByClassName('play-pause-input')[0];
let isDragging = false;
let current_tab = localStorage.getItem('current-tab');
const close_button = document.getElementById("close-app");
const next_song_button = document.getElementsByClassName('next-song')[0];
const previous_song_button = document.getElementsByClassName('previous-song')[0];
const listened_to_song = document.getElementById("listened_to_song");
const identified_image = document.getElementsByClassName('identifier-image')[0];
const identified_cover = document.createElement('img');
identified_cover.classList.add('identified-cover');
const identified_song_text = document.getElementById("identifier-name-text");
const identified_artist_text = document.getElementById("identifier-artist-text");
const play_svg = document.getElementsByClassName("play-svg")[0];
const pause_svg = document.getElementsByClassName("pause-svg")[0];
const shuffle_checkbox = document.getElementById("shuffle-checkbox");
const shuffle_svg = document.getElementById("shuffle-svg");
const shuffle_button = document.getElementsByClassName("shuffle")[0];
const repeat_button = document .getElementsByClassName("repeat")[0];
const repeat_button_number = document.getElementsByClassName("repeat-number-svg")[0];
let before_shuffle;

let repeat_value = 0;

const volume_area = document.getElementsByClassName("volume-area")[0];
const volume_bar = document.getElementsByClassName("volume-bar")[0];
const volume_ball = document.getElementsByClassName("volume-ball")[0];
const volume_level = document.getElementsByClassName("volume-meter")[0];
const volume_overlay = document.createElement("div");
const volume_percentage = document.createElement("input");
volume_percentage.setAttribute("type", "number");
volume_percentage.setAttribute("min", "0");
volume_percentage.setAttribute("max", "100");
volume_percentage.classList.add("volume-percentage");

volume_overlay.style.position = 'absolute';
volume_overlay.style.top = 0;
volume_overlay.style.left = 0;
volume_overlay.style.width = '100%';
volume_overlay.style.height = '100%';
volume_overlay.style.zIndex = 2;

let activeElement = document.activeElement;
let myTimeout;
let volume_input_active = false;
const high_volume_svg = document.getElementsByClassName("volume-high-svg")[0];
const normal_volume_svg = document.getElementsByClassName("volume-svg")[0];
const low_volume_svg = document.getElementsByClassName("volume-low-svg")[0];
const mute_svg = document.getElementsByClassName("mute-svg")[0];

// let iframeElement;
// let nestedIframe;
// let canvas;

// let audio_source_ctx;
// let analyser;

// const audioContext = new AudioContext();
// let ctx;


const audio = new Audio();
let currentFileName = '';
let currentSrc = '';
let currentIndex;
let songsToPlay = [];
let priorSongs = [];
let playSource;
let currentSongIndex = 0;
let currentSong;
let allSongs;
let currentSongInfo = {};
let isPlaying;

let listened_trigger = false;
let listened_periods = [];

let artist_index;


overlay.style.position = 'absolute';
overlay.style.top = 0;
overlay.style.left = 0;
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.zIndex = 2;

// Loading previous session

const load_home_nav_underline = () => {
    play_pause_button.checked = true;
    current_tab = localStorage.getItem('current_tab');
    let pre_tab = localStorage.getItem('previous-tab');
    if(pre_tab === null){
        localStorage.setItem('previous-tab', 0);
        pre_tab = localStorage.getItem('previous-tab');
    }

    home_nav_radio[pre_tab].checked = 'checked'
    iframe.src = home_nav_radio[pre_tab].value
    
    home_nav_underline.style.width = '100px';
    let current_label_left = home_nav_radio_label[pre_tab].getBoundingClientRect().left;
    home_nav_underline.style.left = current_label_left + 'px';

    // Load tab
    iframe.src = home_nav_radio[current_tab].value
}
addEventListener('DOMContentLoaded', load_home_nav_underline)

for(let i = 0; i < home_nav_radio.length; i++){
    if(home_nav_radio[i].checked){
        current_tab = i;
        localStorage.setItem('current_tab', i);
        break;
    }
};


// Changing Tabs
const change_tabs = () => {
    // Setting current tab
    
    let home_previous_tab = localStorage.getItem('previous-tab')
    for(let i = 0; i < home_nav_radio.length; i++){
        if(home_nav_radio[i].checked){
            current_tab = i;
            localStorage.setItem('current_tab', i);
            break;
        }
    };

    // iframe loading

    iframe.src = home_nav_radio[current_tab].value

    // Tab animation
    
    let tabs_to_travel = Math.abs(home_previous_tab - current_tab);
    let distance_to_travel = 125 * tabs_to_travel;
    distance_to_travel = distance_to_travel + 100;

    let previous_label_left = home_nav_radio_label[home_previous_tab].getBoundingClientRect().left;
    let current_label_left = home_nav_radio_label[current_tab].getBoundingClientRect().left;


    if(current_tab > home_previous_tab){
        home_nav_underline.style.left = previous_label_left + 'px';
        home_nav_underline.style.width = distance_to_travel + 'px';

        // Delay
        setTimeout(() => {
            home_nav_underline.style.left = current_label_left + 'px';
            home_nav_underline.style.width = '100px';
            localStorage.setItem("previous-tab", current_tab);
        }, 250)
    };

    if(current_tab < home_previous_tab){
        home_nav_underline.style.width = distance_to_travel + 'px';
        home_nav_underline.style.left = current_label_left + 'px';
        
        // Delay
        setTimeout(() => {
            home_nav_underline.style.width = '100px';
            localStorage.setItem("previous-tab", current_tab);
        }, 250)
    };
}

const resize = () => {
    current_tab = localStorage.getItem('current_tab');
    let current_label_left = home_nav_radio_label[current_tab].getBoundingClientRect().left;

    // Change transition style to none to prevent animated resizing

    // Resize
    home_nav_underline.style.left = current_label_left + 'px';
    home_nav_underline.style.width = '100px';

    // Change transition style and property back
}

addEventListener("resize", resize)



function playAudio(fileName, newSrc, index) {
    if(fileName === currentFileName && newSrc === currentSrc && index !== currentIndex) {
        isPlaying = true
        listened_trigger = false;
        listened_periods = []
      play_pause_button.checked = false;
      currentFileName = fileName;
      currentIndex = index;
      currentSrc = newSrc;
      audio.src = newSrc;
      audio.play();
    } else if (fileName !== currentFileName && newSrc !== currentSrc) {
        isPlaying = true
        listened_trigger = false;
        listened_periods = []
      play_pause_button.checked = false;
      currentFileName = fileName;
      currentIndex = index;
      currentSrc = newSrc;
      audio.src = newSrc;
      audio.play();
    } 
    else if (audio.paused) {
        play_pause_button.checked = false;
      audio.play();
      isPlaying = true;
      currentSongInfo.isPlaying = isPlaying;
      currentSongInfo.update = false;
      currentSongInfo.shuffled = false;
      iframe.contentWindow.postMessage(currentSongInfo, '*');
    } else {
        play_pause_button.checked = true
      audio.pause();
      pause_svg.style.display = 'none';
      setTimeout(() => {
        play_svg.style.display = 'block';
      }, 50);
      
      isPlaying = false;
      currentSongInfo.isPlaying = isPlaying;
      currentSongInfo.update = false;
      currentSongInfo.shuffled = false;
      iframe.contentWindow.postMessage(currentSongInfo, '*');
    //   audio_source_ctx.disconnect(); // Disconnect the existing source node if any
    }
};
function setCurrentSongInfo (receivedVariable) {
    playSource = receivedVariable.source
    currentSong = receivedVariable.currentSong;
    let index_of_current_song;

    if(playSource === 'queue'){
        receivedVariable.allsongs.forEach((song, i) => {
            if(song.fileName === currentSong.fileName && song.location === currentSong.location && song.index === currentSong.index){
                index_of_current_song = i
            }
        });
    } else {
        receivedVariable.allsongs.forEach((song, i) => {
            if(song.fileName === currentSong.fileName && song.location === currentSong.location){
                index_of_current_song = i
            }
        });
    }

   
    songsToPlay = receivedVariable.allsongs.slice(index_of_current_song);
    priorSongs = receivedVariable.allsongs.slice(0, index_of_current_song);
    // shuffle_audio();
    currentSongInfo.index_of_current_song = index_of_current_song;
    currentSongInfo.isPlaying = isPlaying;
    currentSongInfo.songsToPlay = songsToPlay;
    currentSongInfo.priorSongs = priorSongs;
    currentSongInfo.currentSong = currentSong;
    currentSongInfo.update = false;
    currentSongInfo.shuffled = false;
    iframe.contentWindow.postMessage(currentSongInfo, '*');
}

function messageRecievedFromSongsTab(receivedVariable){
    allSongs = receivedVariable.allsongs;
    before_shuffle= receivedVariable.allsongs
    // localStorage.setItem('currentSong', JSON.stringify(currentSongArr));
    // localStorage.setItem('allSongs', JSON.stringify(receivedVariable.allsongs));
    setCurrentSongInfo(receivedVariable)
    playAudio(receivedVariable.currentSong.fileName ,receivedVariable.currentSong.location, receivedVariable.currentSong.index)
}

window.addEventListener('message', function(event) {
    let receivedVariable = event.data;

    if (receivedVariable.source === 'allSongs' && receivedVariable.playASong === true) {
        currentSongInfo = Object.assign({}, receivedVariable.currentSong)
        currentSongInfo.playASong = true;
        messageRecievedFromSongsTab(receivedVariable)
    } else if (receivedVariable.source === 'artists' && receivedVariable.playASong === true) {
        currentSongInfo = Object.assign({}, receivedVariable.currentSong)
        currentSongInfo.playASong = true
        messageRecievedFromSongsTab(receivedVariable)
    } else if (receivedVariable.source === 'queue' && receivedVariable.load_page === true) {
        currentSongInfo.update = false;
        currentSongInfo.shuffled = false;
        iframe.contentWindow.postMessage(currentSongInfo, '*');
    } else if (receivedVariable.source === 'queue' && receivedVariable.playASong === true) {
        currentSongInfo = Object.assign({}, receivedVariable.currentSong)
        currentSongInfo.playASong = true;
        messageRecievedFromSongsTab(receivedVariable)
    } else if (receivedVariable.hasOwnProperty('purpose') && receivedVariable.purpose === 'playNext') {
        songsToPlay.splice(1, 0, receivedVariable.selected_song);
        let combined_songs = [...priorSongs, ...songsToPlay];
        updateIndexForRepeatedObjects(combined_songs);
        currentSongInfo.songsToPlay = songsToPlay;
    }
    // else if(receivedVariable.hasOwnProperty('update_songs_tab') && receivedVariable.update_songs_tab === true){
    //         iframe.contentWindow.postMessage(currentSongInfo, '*');
    // }
    // else if(receivedVariable.source === 'artists' && receivedVariable.playASong === true){
    //     currentSongInfo = receivedVariable.currentSong;
    //     console.log(currentSongInfo)
    //     currentSongInfo.playASong = true
    //     artist_index = receivedVariable.index
    //     messageRecievedFromSongsTab(receivedVariable)
    // } else if(receivedVariable.source === 'artists' && receivedVariable.playASong === true && receivedVariable.resume === true){
    //     console.log(artist_index, receivedVariable.index)
    // }
});

// function drawVisualizer (bufferLength, x, wave_width, wave_height, dataArray){
//     for(let i = 0; i < bufferLength; i++) {
//         const red = i * wave_height/20;
//         const green = i * 4;
//         const blue = wave_height / 2;
//         wave_height = dataArray[i] * 0.7;
//         ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
//         ctx.fillRect(x, canvas.height - wave_height, wave_width, wave_height);
//         x += wave_width;
//     }  
// };

iframe.addEventListener('load', function() {
    // canvas = iframe.contentDocument.getElementById('canvas');
    // ctx = canvas.getContext('2d');
    if(isPlaying){
    currentSongInfo.playASong = false;
    currentSongInfo.update = false;
    currentSongInfo.shuffled = false;
    iframe.contentWindow.postMessage(currentSongInfo, '*');
    }
})

next_song_button.addEventListener('click', () => {
    // allSongs = JSON.parse(localStorage.getItem('allSongs'));
    // currentSong = JSON.parse(localStorage.getItem('currentSong'))[0];
    if(repeat_value === 1){
        listened_trigger = false;
        listened_periods = []   ;
        audio.pause();

        // audio_source_ctx.disconnect();
        if(songsToPlay.length > 1){
            priorSongs.push(songsToPlay[0]);
            songsToPlay.shift();
            currentSong = songsToPlay[0];
            currentFileName = currentSong.fileName;
            currentSrc = currentSong.location;
            currentIndex = currentSong.index;
            audio.src = currentSrc;
            audio.play();
            currentSongInfo = currentSong;
            currentSongInfo.update = true;
            currentSongInfo.shuffled = false;
            iframe.contentWindow.postMessage(currentSongInfo, '*');
        } else {
            // songsToPlay.shift();
            priorSongs.push(songsToPlay[0]);
            // if(priorSongs.length >= (2 * allSongs.length)){
            //     priorSongs = priorSongs.slice(0, allSongs.length)
            // }
            songsToPlay = [...priorSongs];
            currentSong = songsToPlay[0];
            currentFileName = currentSong.fileName;
            currentSrc = currentSong.location;
            currentIndex = currentSong.index;
            audio.src = currentSrc;
            audio.play();
            currentSongInfo = currentSong;
            currentSongInfo.update = true;
            currentSongInfo.shuffled = false;
            iframe.contentWindow.postMessage(currentSongInfo, '*');
        }
    } 

    if(repeat_value === 0){
        listened_trigger = false;
        listened_periods = []
        audio.pause();

        // audio_source_ctx.disconnect();
        if(songsToPlay.length > 1){
            priorSongs.push(currentSong);
            songsToPlay.shift();
            currentSong = songsToPlay[0];
            currentFileName = currentSong.fileName;
            currentSrc = currentSong.location;
            currentIndex = currentSong.index;
            audio.src = currentSrc;
            audio.play();
            currentSongInfo = currentSong;
            currentSongInfo.update = true;
            currentSongInfo.shuffled = false;
            iframe.contentWindow.postMessage(currentSongInfo, '*');
        } else {
            pause_svg.style.display = 'none';
            setTimeout(() => {
                play_svg.style.display = 'block';
            }, 50);
        }
    }

    // if(repeat_value === 0) {
    //         if(songsToPlay.length > 1){
    //             priorSongs.push(currentSong)
    //             let index_of_current_song = allSongs.indexOf(currentSong);
    //             songsToPlay.shift();
    //             currentSong = songsToPlay[0];
    //             playAudio(songsToPlay[0].location);
    //             index_of_current_song = allSongs.indexOf(currentSong);
    //             currentFileName = currentSong.fileName;
    //             currentSrc = currentSong.location;
    //             currentIndex = currentSong.index;
    //             currentSongInfo = currentSong
    //             currentSongInfo.index_of_current_song = index_of_current_song;
    //             currentSongInfo.isPlaying = isPlaying;
    //             currentSongInfo.songsToPlay = songsToPlay;
    //             currentSongInfo.priorSongs = priorSongs;
    //             currentSongInfo.playASong = false;
    //             currentSongInfo.update = true;
    //             currentSongInfo.shuffled = false;
    //             iframe.contentWindow.postMessage(currentSongInfo, '*');
    //         }  
    //     }
});

previous_song_button.addEventListener('click', () => {
    // if(playSource === 'allSongs'){
        // let index_of_current_song = allSongs.findIndex(obj => obj.fileName === currentSong.fileName && obj.location === currentSong.location);
        // let index_of_previous_song = index_of_current_song - 1;
        if(priorSongs.length > 0){
            if(audio.currentTime < 10){
            songsToPlay.unshift(priorSongs[priorSongs.length - 1]);
            priorSongs.pop()
            currentSong = songsToPlay[0];
            currentSongInfo = currentSong;
            // index_of_current_song = index_of_previous_song;
            currentFileName = currentSong.fileName;
            currentSrc = currentSong.location;
            currentIndex = currentSong.index;
            audio.src = currentSrc;
            audio.play();

            // currentSongInfo.index_of_current_song = index_of_current_song;
            currentSongInfo.isPlaying = isPlaying;
            currentSongInfo.songsToPlay = songsToPlay;
            currentSongInfo.priorSongs = priorSongs;
            currentSongInfo.playASong = false;
            currentSongInfo.update = true;
            currentSongInfo.shuffled = false;
            iframe.contentWindow.postMessage(currentSongInfo, '*');
            } else {
                audio.currentTime = 0;
            }
        } else if (audio.currentTime < 10) {
            audio.currentTime = 0;
        }

    // } 
    // else if(playSource === 'artists'){
    //     let index_of_current_song = allSongs.indexOf(currentSong);
    //     let index_of_previous_song = index_of_current_song - 1;
    //     if(index_of_previous_song > -1){
    //         songsToPlay.unshift(allSongs[index_of_previous_song]);
    //         currentSong = songsToPlay[0];
    //         index_of_current_song = index_of_previous_song;
    //         currentSrc = currentSong.location;
    //         audio.src = currentSrc;
    //         audio.play();

    //         currentSrc = currentSong.location;
    //         currentSongInfo.index_of_current_song = index_of_current_song;
    //         currentSongInfo.songBeforePrevious = allSongs.indexOf(songsToPlay[1])
    //         currentSongInfo.isPlaying = isPlaying;
    //         currentSongInfo.songsToPlay = songsToPlay;
    //         currentSongInfo.playASong = false;
    //         iframe.contentWindow.postMessage(currentSongInfo, '*');
    //     }
    // }
})

const play_pause_audio = () => {
    playAudio(currentSong.fileName, currentSong.location, currentSong.index);
}

const shuffle_audio = () => {
    if(shuffle_checkbox.checked){
        if(songsToPlay.length > 3){
            songsToPlay = shuffleArray(songsToPlay);
            allSongs = [...priorSongs, ...songsToPlay];

            currentSongInfo.isPlaying = isPlaying;
            currentSongInfo.songsToPlay = songsToPlay;
            currentSongInfo.priorSongs = priorSongs;
            currentSongInfo.currentSong = currentSong;
            currentSongInfo.update = false;
            currentSongInfo.shuffled = true;
            iframe.contentWindow.postMessage(currentSongInfo, '*');
        }
        shuffle_button.classList.add('shuffle-svg-on');
    } else {
        shuffle_button.classList.remove('shuffle-svg-on');
        allSongs = [...before_shuffle];
        let index_of_current_song;

        allSongs.forEach((song, i) => {
            if(song.fileName === currentSong.fileName && song.location === currentSong.location){
                index_of_current_song = i
            }
        });

        songsToPlay = allSongs.slice(index_of_current_song);
        priorSongs = allSongs.slice(0, index_of_current_song);
        currentSongInfo.index_of_current_song = index_of_current_song;
        currentSongInfo.isPlaying = isPlaying;
        currentSongInfo.songsToPlay = songsToPlay;
        currentSongInfo.priorSongs = priorSongs;
        currentSongInfo.currentSong = currentSong;
        currentSongInfo.update = false;
        currentSongInfo.shuffled = true;
        iframe.contentWindow.postMessage(currentSongInfo, '*');
    }
}

shuffle_checkbox.addEventListener('change', shuffle_audio);

//Fisher-Yates Algorithm

function shuffleArray(array) {
    for (let i = array.length - 1; i > 1; i--) {
        const j = Math.floor(Math.random() * (i - 1)) + 1;
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

repeat_button.addEventListener('click', () => {
    if(repeat_value <= 1){
        repeat_value++;
    } else {
        repeat_value = 0;
    }
    if(repeat_value === 0){
        repeat_button.style.opacity = '0.4';
        repeat_button_number.style.opacity = '0';
    }
    if(repeat_value === 1){
        repeat_button.style.opacity = '1';
    }
    if (repeat_value === 2){
        repeat_button_number.style.opacity = '1';
    }
})

audio.addEventListener('timeupdate', function() {
    let expectedListenSize = Math.round(0.3 * audio.duration);
    let listen_percentage = (audio.currentTime / audio.duration) * 100;
    let listened_periods_set = new Set(listened_periods);
    
    if(listened_periods_set.size < (expectedListenSize + 10)){
            listened_periods.push(Math.round(audio.currentTime))
    }
    if(listened_trigger === false && listen_percentage > 30 && listened_periods_set.size >= expectedListenSize){
        listened_to_song.value = currentSong.fileName
        listened_to_song.click()
        listened_trigger = true;
    }
    songSlider.value = (audio.currentTime / audio.duration) * 1000;
    var rect = sliderLabel.getBoundingClientRect();
    let sliderBallLeft = ((songSlider.value / 1000) * rect.width);
        
    if (!isDragging) {
        sliderBall.style.left = sliderBallLeft + 'px';
    }
    localStorage.setItem('songSliderValue', songSlider.value);
});

audio.addEventListener('play', function() {
        if(currentSong.covers.hasOwnProperty('song_cover') && currentSong.covers.song_cover !== identified_cover.src){
            identified_cover.src = currentSong.covers.song_cover;
            identified_image.appendChild(identified_cover);
        } else if (currentSong.covers.hasOwnProperty('other_cover') && currentSong.covers.other_cover !== identified_cover.src){
            identified_cover.src = currentSong.covers.other_cover;
            identified_image.appendChild(identified_cover);
        } else if (currentSong.covers.hasOwnProperty('album_cover') && currentSong.covers.album_cover !== identified_cover.src){
            identified_cover.src = currentSong.covers.album_cover;
            identified_image.appendChild(identified_cover);
        } else if (currentSong.covers.hasOwnProperty('artist_cover') && currentSong.covers.artist_cover !== identified_cover.src){
            identified_cover.src = currentSong.covers.artist_cover;
            identified_image.appendChild(identified_cover);
        } else {
            if(identified_image.hasChildNodes()){
                identified_image.removeChild(identified_image.lastChild);
            }
        }
    
    play_svg.style.display = 'none';
    setTimeout(() => {
        pause_svg.style.display = 'block';
      }, 50);
    // if(identified_song_width > 210){
        // console.log(identified_song_width)
        // let identified_song_translate_percentage = ((identified_song_width / 210) * 100) -100;
        // // console.log(identified_song_translate_percentage)
        // identified_song.getElementsByTagName('span')[0].style.transition = 'linear'
        // identified_song.getElementsByTagName('span')[0].style.transitionDuration = `${identified_song_translate_percentage * 0.4}s`;
        // identified_song.getElementsByTagName('span')[0].style.transform = `translateX(-${identified_song_translate_percentage}%)`;
    // }
    let index_of_current_song = allSongs.indexOf(currentSong);
    isPlaying = true;
    currentSongInfo.index_of_current_song = index_of_current_song;
    currentSongInfo.isPlaying = isPlaying;
    currentSongInfo.songsToPlay = songsToPlay;
    currentSongInfo.priorSongs = priorSongs;
    currentSongInfo.playASong = false;
    currentSongInfo.update = true;
    currentSongInfo.shuffled = false;
    iframe.contentWindow.postMessage(currentSongInfo, '*');

    if(currentSong.title === undefined){

    identified_song_text.textContent = currentSong.fileName;
    identified_artist_text.textContent = currentSong.artist;

    const identifierNameSpan = document.getElementById('identifier-name-text');
    identifierNameSpan.style.transition = 'none';
    identifierNameSpan.style.left = `0px`;


    if (identifierNameSpan.getBoundingClientRect().width > 210) {
        const translatePercentage = Math.ceil(((identifierNameSpan.getBoundingClientRect().width / 210) * 100) - 100);

        let translate_duration = `${(translatePercentage * 50)}`
        setTimeout(() => {
            identifierNameSpan.style.transition = 'linear';
            identifierNameSpan.style.transitionDuration = `${translate_duration}ms`;
            identifierNameSpan.style.left = `-${translatePercentage}%`;
            identifierNameSpan.addEventListener('transitionend', ()=> {
                setTimeout(()=> {
                    identifierNameSpan.style.transition = 'none';
                    identifierNameSpan.style.left = `0px`;
                }, 3000)
            })
        }, 2000)

    }
    } else {
        // identifierNameSpan.style.transition = 'none';
        // identifierNameSpan.style.left = `0px`;
        
        identified_song_text.textContent = currentSong.title;
        identified_artist_text.textContent = currentSong.artist;
    
        const identifierNameSpan = document.getElementById('identifier-name-text');
    
        if (identifierNameSpan.getBoundingClientRect().width > 210) {
            const translatePercentage = Math.ceil(((identifierNameSpan.getBoundingClientRect().width / 210) * 100) - 100);
    
            let translate_duration = `${(translatePercentage * 50)}`
            setTimeout(() => {
                identifierNameSpan.style.transition = 'linear';
                identifierNameSpan.style.transitionDuration = `${translate_duration}ms`;
                identifierNameSpan.style.left = `-${translatePercentage}%`;
                identifierNameSpan.addEventListener('transitionend', ()=> {
                    setTimeout(()=> {
                        identifierNameSpan.style.transition = 'none';
                        identifierNameSpan.style.left = `0px`;
                    }, 3000)
                })
            }, 2000)
    
        }
    }

    // if(identified_song_text.getBoundingClientRect().width > 210){
    //     let identified_song_translate_percentage = ((identified_song_text.getBoundingClientRect().width / 210) * 100) -100;
    //     identified_song_text.style.transition = 'linear';
    //     identified_song_text.style.transitionDuration = `${identified_song_translate_percentage * 0.4}s`;
    //     identified_song_text.style.transform = `translateX(-${identified_song_translate_percentage}%)`;
    // }

    // audio_source_ctx = audioContext.createMediaElementSource(audio);
    
    // audio_source_ctx.connect(audioContext.destination);

    // analyser = audioContext.createAnalyser();
    // audio_source_ctx.connect(analyser);
    // analyser.connect(audioContext.destination);
    // analyser.fftSize = 16384;
    // const bufferLength = analyser.frequencyBinCount;
    // const dataArray = new Uint8Array(bufferLength);
    // const wave_width = canvas.width / bufferLength;
    // let wave_height;
    // let x;

    // class Wave {
    //     constructor(x, y, width, height, color){
    //         this.x = x;
    //         this.y = y;
    //         this.witdh = width;
    //         this.height = height;
    //         this.color = color;    
    //     }
    //     update(){
    //         this.x++;
    //     }
    //     draw(context){
    //         context.strokeStyle = this.color
    //         context.save()
    //         context.translate(canvas.width/ 2, canvas.height/ 2)
    //         // context.fillRect(this.x, this.y, this.witdh, this.height);
    //         context.beginPath();
    //         context.moveTo(0, 0);
    //         context.lineTo(0, this.y)
    //         context.stroke();
    //         context.restore();
    //     }
    // }

    // let waves = []
    // function createWaves() {
    //     for(let i = 0; i < 256; i++){
    //         let color = `hsl(${i * 2}, 100%, 50%)`
    //         waves.push(new Wave(i * (canvas.width / 256), i * (canvas.height / 512), 2, 10, color))
    //     }
    // }
    // createWaves();

    // function animate_playing() {
    //     x = 0;
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     // waves.forEach(function(wave){
    //     //     wave.update()
    //     //     wave.draw(ctx)
    //     // })
    //     analyser.getByteFrequencyData(dataArray);
    //     drawVisualizer (bufferLength, x, wave_width, wave_height, dataArray)
    //     requestAnimationFrame(animate_playing);

    // }
    // animate_playing()

});

audio.addEventListener('pause', function() {
    let index_of_current_song = allSongs.indexOf(currentSong);
    isPlaying = false;
    currentSongInfo.index_of_current_song = index_of_current_song;
    currentSongInfo.isPlaying = isPlaying;
    currentSongInfo.songsToPlay = songsToPlay;
    currentSongInfo.priorSongs = priorSongs;
    currentSongInfo.playASong = false;
    currentSongInfo.update = true;
    currentSongInfo.shuffled = false;
    iframe.contentWindow.postMessage(currentSongInfo, '*');
});

audio.addEventListener('ended', () => {
    if(repeat_value === 1){
        listened_trigger = false;
        listened_periods = []   ;
        audio.pause();

        // audio_source_ctx.disconnect();
        if(songsToPlay.length > 1){
            priorSongs.push(currentSong);
            songsToPlay.shift();
            currentSong = songsToPlay[0];
            currentFileName = currentSong.fileName;
            currentSrc = currentSong.location;
            currentIndex = currentSong.index;
            audio.src = currentSrc;
            audio.play();
            currentSongInfo = currentSong;
            currentSongInfo.update = true;
            currentSongInfo.shuffled = false;
            iframe.contentWindow.postMessage(currentSongInfo, '*');
        } else {
            priorSongs.push(currentSong);
            if(priorSongs.length >= (2 * allSongs.length)){
                priorSongs = priorSongs.slice(0, allSongs.length)
            }
            songsToPlay = [...priorSongs];
            currentSong = songsToPlay[0];
            currentFileName = currentSong.fileName;
            currentSrc = currentSong.location;
            currentIndex = currentSong.index;
            audio.src = currentSrc;
            audio.play();
            currentSongInfo = currentSong;
            currentSongInfo.update = true;
            currentSongInfo.shuffled = false;
            iframe.contentWindow.postMessage(currentSongInfo, '*');
        }
    }

    if(repeat_value === 0){
        listened_trigger = false;
        listened_periods = []
        audio.pause();

        // audio_source_ctx.disconnect();
        if(songsToPlay.length > 1){
            priorSongs.push(currentSong);
            songsToPlay.shift();
            currentSong = songsToPlay[0];
            currentFileName = currentSong.fileName;
            currentSrc = currentSong.location;
            currentIndex = currentSong.index;
            audio.src = currentSrc;
            audio.play();
            currentSongInfo = currentSong;
            currentSongInfo.update = true;
            currentSongInfo.shuffled = false;
            iframe.contentWindow.postMessage(currentSongInfo, '*');
        } else {
            pause_svg.style.display = 'none';
            setTimeout(() => {
                play_svg.style.display = 'block';
            }, 50);
        }
    }

    if(repeat_value === 2){
        listened_trigger = false;
        listened_periods = []
        audio.pause();
        audio.play();

        // audio_source_ctx.disconnect();
        // if(songsToPlay.length > 1){
        //     songsToPlay.shift();
        //     currentSong = songsToPlay[0];
        //     console.log(currentSong)
        //     currentSrc = currentSong.location;
        //     audio.src = currentSrc;
        //     audio.play();
        //     currentSongInfo = currentSong;
        //     currentSongInfo.update = true;
        //     currentSongInfo.shuffled = false;
        //     iframe.contentWindow.postMessage(currentSongInfo, '*');
        // } else {
        //     pause_svg.style.display = 'none';
        //     setTimeout(() => {
        //         play_svg.style.display = 'block';
        //     }, 50);
        // }
    }
});


sliderLabel.addEventListener('mousedown', function(event) {
    event.stopPropagation();
    var rect = sliderLabel.getBoundingClientRect();
    var position = event.clientX - rect.left;
    if (position >= 0 && position <= rect.width) {
        sliderBall.style.left = position + 'px';
        var percentage = position / rect.width;
        songSlider.value = percentage * songSlider.max;
        songSlider.dispatchEvent(new Event('input'));
    }
});

sliderBall.addEventListener('mousedown', function(event) {
    event.stopPropagation();
    isDragging = true;
    document.body.appendChild(overlay);
    sliderBall.classList.add('no-transition');
});

overlay.addEventListener('mousemove', function(event) {
    if (isDragging) {
        var rect = sliderLabel.getBoundingClientRect();
        var position = event.clientX - rect.left;
        if (position >= 0 && position <= rect.width) {
            sliderBall.style.left = position + 'px';
        }
    }
});

overlay.addEventListener('mouseup', function(event) {
    sliderBall.classList.remove('no-transition');
    isDragging = false;
    if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
    const sliderBallLeft = sliderBall.getBoundingClientRect().left;
    var rect = sliderLabel.getBoundingClientRect();
    var percentage = sliderBallLeft / rect.width;
    songSlider.value = percentage * songSlider.max;
    songSlider.dispatchEvent(new Event('input'));
});


addEventListener('DOMContentLoaded', function() {
    let storedValue = localStorage.getItem('songSliderValue');
    if(storedValue === Number){
        songSlider.value = storedValue;
    } else {
        songSlider.value = 0;
    }
})

volume_ball.addEventListener('mousedown', function(event) {
    event.stopPropagation();
    volume_input_active = true;
    isDragging = true;
    document.body.appendChild(volume_overlay);
    volume_ball.classList.add('no-transition');
    if(myTimeout !== undefined){
        myTimeout.pause();
    }
});

volume_overlay.addEventListener('mousemove', function(event) {
    if (isDragging) {
        var rect = volume_bar.getBoundingClientRect();
        var position = event.clientX - rect.left;
        if (position >= 0 && position <= rect.width) {
            volume_ball.style.left = position + 'px';
            volume_level.style.width = `${position / rect.width * 100}%`;
            audio.volume = position / rect.width;
            volume_percentage.value = `${Math.round(position / rect.width * 100)}`;
            localStorage.setItem('volume', volume_percentage.value);
        }
    }
    setVolumeIcon();
});

volume_overlay.addEventListener('mouseup', function(event) {
    volume_input_active = false;
    volume_ball.classList.remove('no-transition');
    isDragging = false;
    if (volume_overlay.parentNode) {
        volume_overlay.parentNode.removeChild(volume_overlay);
    }
    myTimeout.reset();
    myTimeout.pause();
});

volume_area.addEventListener('mouseenter', (event) => {
    volume_percentage.value = `${Math.round(audio.volume * 100)}`;
    volume_area.appendChild(volume_percentage);
    volume_ball.style.opacity = '1';
    if(myTimeout === undefined){
        myTimeout = new PausableTimeout(() => {
            volume_ball.style.opacity = '0';
            volume_percentage.remove();
        }, 2000);
        myTimeout.pause();
    }
    if(myTimeout !== undefined){
        myTimeout.reset();
        myTimeout.pause();
    }
});

volume_area.addEventListener('mouseleave', () => {
    if(volume_input_active === false){
        myTimeout.reset();
    }
});

volume_area.addEventListener('keydown', (event) => {
    if(event.key === 'Enter'){
        volume_input_active = false;
        volume_percentage.blur();
    }
});

volume_percentage.addEventListener('click', () => {
    volume_input_active = true;
    myTimeout.pause();
});

volume_percentage.addEventListener('focus', () => {
    volume_input_active = true;
    if(myTimeout !== undefined){
        myTimeout.pause();
    }
});

volume_percentage.addEventListener('focusout', () => {
    volume_input_active = false;
    if(myTimeout !== undefined){
        myTimeout.reset();
    }
});

volume_percentage.addEventListener('input', () => {
    audio.volume = volume_percentage.value / 100;
    volume_level.style.width = `${volume_percentage.value / 100 * 100}%`;
    volume_ball.style.left = `${volume_percentage.value / 100 * 100}%`;
    localStorage.setItem('volume', volume_percentage.value);
    setVolumeIcon();
});

function setVolumeIcon () {
    if(audio.volume === 0){
        mute_svg.style.opacity = '1';
        low_volume_svg.style.opacity = '0';
        normal_volume_svg.style.opacity = '0';
        high_volume_svg.style.opacity = '0';
    }
    if(audio.volume >= 0.01 && audio.volume <= 0.33){
        mute_svg.style.opacity = '0';
        low_volume_svg.style.opacity = '1';
        normal_volume_svg.style.opacity = '0';
        high_volume_svg.style.opacity = '0';
    }
    if(audio.volume >= 0.33 && audio.volume <= 0.66){
        mute_svg.style.opacity = '0';
        low_volume_svg.style.opacity = '0';
        normal_volume_svg.style.opacity = '1';
        high_volume_svg.style.opacity = '0';
    }
    if(audio.volume >= 0.66){
        mute_svg.style.opacity = '0';
        low_volume_svg.style.opacity = '0';
        normal_volume_svg.style.opacity = '0';
        high_volume_svg.style.opacity = '1';
    }
}

volume_bar.addEventListener('click', (event) => {
    var rect = volume_bar.getBoundingClientRect();
        var position = event.clientX - rect.left;
        if (position >= 0 && position <= rect.width) {
            volume_ball.style.left = position + 'px';
            volume_level.style.width = `${position / rect.width * 100}%`;
            audio.volume = position / rect.width;
            volume_percentage.value = `${Math.round(position / rect.width * 100)}`;
            localStorage.setItem('volume', volume_percentage.value);
    }
    setVolumeIcon();
})

addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('volume') === null){
        localStorage.setItem('volume', 100);
    }
    let storedVolume = localStorage.getItem('volume');
    audio.volume = storedVolume / 100;
    volume_percentage.value = storedVolume;
    volume_level.style.width = `${storedVolume / 100 * 100}%`;
    volume_ball.style.left = `${storedVolume / 100 * 100}%`;
    setVolumeIcon();
})

const load_slider_position = () => {
     var rect = sliderLabel.getBoundingClientRect();
     let storedValue = localStorage.getItem('songSliderValue');
     let sliderBallLeft = (storedValue / 1000) * rect.width;
     sliderBall.style.left = sliderBallLeft + 'px';
     songSlider.value = storedValue
}
addEventListener('DOMContentLoaded', load_slider_position);

songSlider.addEventListener('input', function(event) {
    localStorage.setItem('songSliderValue', songSlider.value);
    audio.pause()
    // audio_source_ctx.disconnect(); // Disconnect the existing source node if any
    audio.currentTime = (songSlider.value / 1000) * audio.duration;
    audio.play()
});

close_button.addEventListener('mouseover', () => {
    let current_song_time = audio.currentTime;
    localStorage.setItem('current_song_time', current_song_time);
})

iframe.addEventListener('load', () => {
    currentSongInfo.update = false;
    currentSongInfo.shuffled = false;
    iframe.contentWindow.postMessage(currentSongInfo, '*');
})

function PausableTimeout(callback, delay) {
    let timeoutId = null;
    let remaining = delay;

    this.pause = function() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            remaining -= Date.now() - start;
            timeoutId = null;
        }
    };
    this.resume = function() {
        if (!timeoutId) {
            start = Date.now();
            timeoutId = setTimeout(callback, remaining);
        }
    };

    this.reset = function(newDelay) {
        remaining = newDelay !== undefined ? newDelay : delay;
        this.pause();
        this.resume();
    };

    let start = Date.now();
    timeoutId = setTimeout(callback, remaining);
}

// iframe.onload = () => {
//     let background_image = localStorage.getItem('background_image');
//     if(background_image !== null){
//         if(background_image === true){
//             home_body.style.background = `rgb(31, 30, 30)`
//         } else {
//             home_body.style.backgroundImage = `linear-gradient(#642bff, #ff22e6)`
//             // home_body.style.backgroundColor = `yellow`;
//         }
//     }
// }
// Create a MutationObserver instance
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.attributeName === 'style') {
      var newColor = iframe.style.backgroundColor;
      console.log('New background color:', newColor);
      // Perform your logic here when the background color changes
    }
  });
});

// Start observing the iframe element for attribute changes
observer.observe(iframe, { attributes: true });

function updateIndexForRepeatedObjects(array) {
    const indexMap = new Map();
  
    array.forEach(obj => {
      // Create a unique key based on name and location
      const key = `${obj.fileName}-${obj.location}`;
      if (indexMap.has(key)) {
        obj.index = indexMap.get(key);
        indexMap.set(key, obj.index + 1);
      } else {
        indexMap.set(key, 1);
      }
    });
}