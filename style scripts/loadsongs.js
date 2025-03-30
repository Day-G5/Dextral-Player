async function readData() {
  const data = await fetch('../electron/media_files.json');
  const res = await data.json();
  return res;
}

const body = document.getElementsByTagName('body')[0];
const song_container = document.getElementsByClassName('songs-container')[0];
const scroll_bar = document.getElementsByClassName('scroll-bar')[0];
const scroll_thumb = document.getElementsByClassName('scroll-thumb')[0];

let isPlaying = false;

const right_click_overlay = document.createElement('div');
right_click_overlay.classList.add('right-click-overlay');
right_click_overlay.addEventListener('click', (event) => {
  event.stopPropagation();
  if(right_click_overlay.hasChildNodes()){
    while (right_click_overlay.firstChild) {
      right_click_overlay.removeChild(right_click_overlay.firstChild);
    }
  }
  body.removeChild(right_click_overlay);
})

const scroll_overlay = document.createElement('div');
scroll_overlay.classList.add('scroll-overlay');
let scroll_isDragging = false;

const play_pause_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" class="play-pause-svg" id="play-pause-svg"><path class="play-svg" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/><path class="pause-svg" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>';

// const song_indicator = document.getElementsByClassName('song-indicator')[0];
const scroll_up = document.createElement('div');
scroll_up.classList.add('scroll-up');
const scroll_down = document.createElement('div');
scroll_down.classList.add('scroll-down');

let playBlock = {}
playBlock.currentSong;
let song_index = 0;
let recieved_current_song;
// let recieved_current_song_index;
let recieved_previous_song_index;
let previous_song;
let current_song_duartion;
let current_song_label_id;
let isPlaying_;
let isPaused = true;
let classes_arr = [];
let skip_previous_value;
// let timeValue = 0; // This variable will hold the current time value
// let timerInterval; 
let loaded_all_songs;
let mutable_all_songs;
let playing_song;

function updateUI(data) {
  // Clear existing items
  document.getElementById('songs-container').innerHTML = '';
  // Add new items
  data.forEach(item => {
    let div = document.createElement('div');
    div.textContent = item.filename;
    document.getElementById('songs-container').appendChild(div);
  });
}

// Initial load
// readData().then(updateUI).catch(console.error);


class DivCreator {
    constructor(obj) {
      this.isPlaying = false;

      const parser = new DOMParser();
      const svgElement = parser.parseFromString(play_pause_svg, 'image/svg+xml');
      this.svgDoc = svgElement.documentElement;

      this.play_svg = this.svgDoc.getElementsByClassName('play-svg')[0];
      this.pause_svg = this.svgDoc.getElementsByClassName('pause-svg')[0];

      this.song_id = obj.fileName;

      this.container = song_container;
      this.songIndex = song_index;

      this.div = document.createElement('div');
      this.div.classList.add('single-song');
      this.div.id = `song-label-${this.songIndex}`;
      this.div.style.display = 'flex';

      this.checkbox = document.createElement('input');
      this.checkbox.type = 'checkbox';
      this.checkbox.id = obj.fileName;
      this.checkbox.name = 'single-song;'
      this.checkbox.classList.add('hide');

      this.song_name = document.createElement('div')
      this.song_name_text = document.createElement('span')
      this.song_name_text.classList.add('song-name-text')
      this.song_name_text.textContent = `${obj.fileName}`;
      this.song_name.classList.add('song-name');

      this.cover_exists = false;

      if(obj.covers.hasOwnProperty('cover')) {
        this.song_background = document.createElement('img');
        this.song_background.src = obj.covers.cover
        this.song_background.classList.add('song-background');
        this.cover_exists = true;
      } else if(obj.covers.hasOwnProperty('other_cover')) {
        this.song_background = document.createElement('img');
        this.song_background.src = obj.covers.other_cover
        this.song_background.classList.add('song-background');
        this.cover_exists = true;
      } else if (obj.covers.hasOwnProperty('album_cover')) {
        this.song_background = document.createElement('img');
        this.song_background.src = obj.covers.album_cover
        this.song_background.classList.add('song-background');
        this.cover_exists = true;
      } else if(obj.covers.hasOwnProperty('artist_cover')) {
        this.song_background = document.createElement('img');
        this.song_background.src = obj.covers.artist_cover
        this.song_background.classList.add('song-background');
        this.cover_exists = true;
      }

      this.shade = document.createElement('div');
      this.shade.classList.add('shade');
      

      this.play_button = document.createElement('button')
        this.play_button.textContent = 'play';
        this.play_button.id = obj.fileName + 'play-button';
        this.play_button.classList.add('play_button')
        this.play_button.addEventListener('click', (event) => {
            event.stopPropagation();
            playBlock.source = 'allSongs'
            playBlock.allsongs = loaded_all_songs;
            playBlock.currentSong = obj.playInfo();
            playBlock.currentSongId = this.div.id;
            playBlock.playASong = true; 
            window.parent.postMessage(playBlock, '*');
      });
      this.play_button.visibility = 'hidden';

      this.song_artist = document.createElement('div')
    this.artist = obj.artist
    if(this.artist === undefined){
    this.song_artist.textContent = 'Unknown Artist'
    this.song_artist.classList.add('artist')
    }
    else if(this.artist === null){
      this.song_artist.textContent = 'Unknown Artist'
      this.song_artist.classList.add('artist')
    }
    else if(this.artist === 'null'){
      this.song_artist.textContent = 'Unknown Artist'
      this.song_artist.classList.add('artist')
    }
    else if(this.artist === 'Unknown'){
      this.song_artist.textContent = 'Unknown Artist'
      this.song_artist.classList.add('artist')
    }
    else if(this.artist === 'unknown'){
      this.song_artist.textContent = 'Unknown Artist'
      this.song_artist.classList.add('artist')
    }
    else if(this.artist === 'Unknown Artist'){
      this.song_artist.textContent = 'Unknown Artist'
      this.song_artist.classList.add('artist')
    }
    else if(this.artist === 'unknown artist'){
      this.song_artist.textContent = 'Unknown Artist'
      this.song_artist.classList.add('artist')
    }
    else if(this.artist === 'Unknown Artist '){
      this.song_artist.textContent = 'Unknown Artist'
      this.song_artist.classList.add('artist')
    } else {
    const artistNames = obj.artist.split('/');
    let main_artist = artistNames[0];
    const artist_pattern = /[fF][tT]\.?/;
    let contributing_artists;
    // const contributing_artists = [...artistNames]
    // contributing_artists.shift()
    if(artist_pattern.test(main_artist)){
      let split_main_artist = main_artist.split(artist_pattern);
      main_artist = split_main_artist[0].trim();
      let split_contributing = split_main_artist.slice(1);
      let extra = /,\ ?/
      if(extra.test(split_contributing)){
        let further_split = split_contributing.split(/,\ ?/)
        contributing_artists = [...artistNames, ...split_contributing, ...further_split]
      } else {
        contributing_artists = [...artistNames, ...split_contributing]
      }
      contributing_artists.shift();
    } else {
      contributing_artists = [...artistNames]
      contributing_artists.shift()
      contributing_artists.forEach((artist) => {
        artist.trim()
      })
    }

    let formattedArtists
    if(contributing_artists.length > 0){
      formattedArtists = `${main_artist}  <br>ft. ${contributing_artists.join(', ')}`
    } else {
      formattedArtists = `${main_artist}`
    }
    this.song_artist.innerHTML = formattedArtists;
    }
    this.song_artist.classList.add('artist');

    this.updateSongPlayLabel = () => {
      // if(this.isPlaying === false){
      //   this.isPlaying = true;
      // } else {
      //   this.isPlaying = false;
      // }
      if(this.isPlaying){
        this.play_svg.style.fill = 'none';
        this.pause_svg.style.fill = 'yellow';
      } else {
        this.play_svg.style.fill = 'yellow';
        this.pause_svg.style.fill = 'none';
      }
    }

    this.play_button_area = document.createElement('label')
    this.play_button_area.id = `${this.songIndex}-play-button-area`;
    this.play_svg.style.fill = 'yellow';
    this.pause_svg.style.fill = 'none';
    this.play_button_area.classList.add('play-button-area');
    // this.play_button_area.style.backgroundColor = 'yellow';
    this.play_button_area.setAttribute('for', this.play_button.id)
    this.play_button_area.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.play_button.dispatchEvent(new MouseEvent('mousedown'));
      this.updateSongPlayLabel()
    });
    

    this.song_duaration = document.createElement('div')
    this.song_duaration.textContent = `${obj.duration2}`
    this.song_duaration.classList.add('duration')
            
    this.song_image = document.createElement('img')
    this.song_image.setAttribute('src', '../icons/Artist3.png')
    this.song_image.classList.add('song-image');
                       
      // let visibility_overlay = document.createElement('div');
      // visibility_overlay.className = 'visibility-overlay';

      song_index++;

    this.right_click_menu = document.createElement('div');
    this.right_click_menu.classList.add('right-click-menu');
    // this.right_click_menu_play = document.createElement('div');
    // this.right_click_menu_play.classList.add('right-click-menu-options');
    // this.right_click_menu_play.textContent = 'Play';
    // this.right_click_menu_play.addEventListener('click', (event) => {
    //   event.stopPropagation();
    //   this.play_button_area.click();
    //   right_click_overlay.click();
    // });
    this.right_click_menu_playNext = document.createElement('div');
    this.right_click_menu_playNext.classList.add('right-click-menu-options');
    this.right_click_menu_playNext.textContent = 'Play Next';
    this.right_click_menu_playNext.addEventListener('click', (event)=> {
      event.stopPropagation();
      let message = {
        source: 'allSongs',
        purpose: 'playNext',
        selected_song: obj.playInfo(),
      }
      window.parent.postMessage(message, '*');
      right_click_overlay.click();
    });

    this.right_click_menu_playlist = document.createElement('div');
    this.right_click_menu_playlist.classList.add('right-click-menu-options');
    this.right_click_menu_playlist.textContent = 'Add to Playlist';
    this.right_click_menu_playlist.addEventListener('mouseenter', (event) => {
      event.stopPropagation(); 
      right_click_overlay.appendChild(this.right_click_menu_playlist_options);
    });

    this.right_click_menu_playlist_options = document.createElement('div');
    this.right_click_menu_playlist_options.classList.add('right-click-menu');
    this.right_click_menu_playlist_options.style.left = '100%';

    this.playlist_options_create = document.createElement('div');
    this.playlist_options_create.classList.add('right-click-menu-options');

    this.right_click_menu_playlist_options.appendChild(this.playlist_options_create);
    
    this.div.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      this.rightClick(event.x, event.y);
    })
    }

    scrollTo () {
      if(this.div.getBoundingClientRect().top >= 0 && this.div.getBoundingClientRect().bottom <= window.innerHeight){
        if(song_container.querySelector('.scroll-down') !== null){
          song_container.removeChild(scroll_down);
        }
        if(song_container.querySelector('.scroll-up') !== null){
          song_container.removeChild(scroll_up);
        }        
      }
      if(this.div.getBoundingClientRect().top < 0){
        if(song_container.querySelector('.scroll-up') === null){
          song_container.appendChild(scroll_up);
          if(song_container.querySelector('.scroll-down') !== null){
            song_container.removeChild(scroll_down);
          }
        }
      }
      if(this.div.getBoundingClientRect().bottom > window.innerHeight){
        if(song_container.querySelector('.scroll-down') === null){
          song_container.appendChild(scroll_down);
          if(song_container.querySelector('.scroll-up') !== null){
            song_container.removeChild(scroll_up);
          }
        }
      }
    }
  
    createDiv() {
    this.song_name.appendChild(this.song_name_text);
    this.div.appendChild(this.song_name)
    this.div.appendChild(this.play_button)
    this.div.appendChild(this.song_duaration)
    // this.play_button_area.appendChild(this.svgDoc.cloneNode(true));
    this.play_button_area.appendChild(this.svgDoc);
    this.div.appendChild(this.play_button_area)
    this.div.appendChild(this.song_artist)
    this.div.appendChild(this.song_image);
    if(this.cover_exists === true){
      this.div.appendChild(this.song_background);
      this.div.appendChild(this.shade)
    }
    // this.div.appendChild(visibility_overlay) 
    // label.appendChild(song_art)
    if(song_container !== undefined){
      song_container.appendChild(this.div)
    }
    //         song_container.appendChild(checkbox)
    //         song_container.appendChild(label)
  }

  update(isPlaying)  {
    this.isPlaying = isPlaying
    this.updateSongPlayLabel()
  }

  rightClick(x, y) {
    this.right_click_menu.style.left = `${x}px`;
    this.right_click_menu.style.top = `${y}px`;
    // this.right_click_menu.appendChild(this.right_click_menu_play);
    this.right_click_menu.appendChild(this.right_click_menu_playNext);
    this.right_click_menu.appendChild(this.right_click_menu_playlist)
    right_click_overlay.appendChild(this.right_click_menu);
    body.appendChild(right_click_overlay);
  }
}

readData().then((data) => {
  mutable_all_songs = data;
  loaded_all_songs = [];
  data.forEach((item, index) => {
    item.displayClass = [];
    item.displayClass.push(new DivCreator(item));
    item.displayClass[0].createDiv();
    item.playInfo = function() {
      return {
        title: this.title,
        artist: this.artist,
        fileName: this.fileName,
        location: this.location,
        covers: this.covers,
        index: 0,
      }
    }
    loaded_all_songs.push(item.playInfo());
    // if(body.scrollHeight > window.innerHeight){
    //   scroll_bar.style.display = 'flex';
    //   scroll_thumb.style.height = `${100 / (body.scrollHeight / window.innerHeight)}%`
    // }
  });
}).then(() => {
  if(pending_update === true){
    if(pending_data.hasOwnProperty('fileName')){
      mutable_all_songs.forEach((song) => {
        if(song.fileName === pending_data.fileName && song.location === pending_data.location){
          song.displayClass[0].update(pending_data.isPlaying);
          playing_song = song;
          song.displayClass[0].scrollTo();
        } else {
          song.displayClass[0].update(false);
        }
      })
    }
  }
})

let pending_update = false;
let pending_data;

window.addEventListener('scroll', function(event) {
  if(playing_song){
    playing_song.displayClass[0].scrollTo();
  }
})

window.addEventListener('message', function(event) {
  if(mutable_all_songs === undefined){
    pending_update = true;
    pending_data = event.data;
  } else {
    if(event.data !== undefined){
      if(event.data.hasOwnProperty('isPlaying') && event.data.hasOwnProperty('fileName')){
        
      }
      if(skip_previous_value === undefined && event.data.hasOwnProperty('isPlaying') && event.data.hasOwnProperty('fileName')){
        mutable_all_songs.forEach( (song) => {
          if(song.fileName === event.data.fileName && song.location === event.data.location){
            song.displayClass[0].update(event.data.isPlaying);
            playing_song = song;
            song.displayClass[0].scrollTo();
          }
        })
        window.scrollTo(0, (playing_song.displayClass[0].div.offsetTop - 20))
        skip_previous_value = event.data.fileName;
      } else if(skip_previous_value !== undefined && skip_previous_value !== event.data.fileName && event.data !== true){
        mutable_all_songs.forEach( (song) => {
          if(song.fileName === skip_previous_value){
            song.displayClass[0].update(false)
          }
          if(song.fileName === event.data.fileName && song.location === event.data.location){
            song.displayClass[0].update(event.data.isPlaying);
            song.displayClass[0].scrollTo();
            playing_song = song;
          }
        })
        window.scrollTo(0, (playing_song.displayClass[0].div.offsetTop - 20))
        skip_previous_value = event.data.fileName;
      } else if(skip_previous_value !== undefined && skip_previous_value === event.data.fileName) { 
        mutable_all_songs.forEach( (song) => {
          if(song.fileName === event.data.fileName && song.location === event.data.location){
            song.displayClass[0].update(event.data.isPlaying);
            song.displayClass[0].scrollTo();
            playing_song = song;
          } else {
            song.displayClass[0].update(false)
          }
        })
        window.scrollTo(0, (playing_song.displayClass[0].div.offsetTop - 20))
      }
    }
  }
})

window.addEventListener('load', () => {
    let from_songs = {

    };
    from_songs.update_songs_tab = true;
    window.parent.postMessage(from_songs, '*');
});

scroll_up.addEventListener('click', () => {
  window.scrollTo(0, (playing_song.displayClass[0].div.offsetTop - 20));
})

scroll_down.addEventListener('click', () => {
  window.scrollTo(0, (playing_song.displayClass[0].div.offsetTop - 20))
});

// scroll_thumb.addEventListener('mousedown',  (event) => {
//   event.stopPropagation();
//   scroll_isDragging = true
//   body.appendChild(scroll_overlay);
//   scroll_thumb.classList.add('no-transition')
// });

// scroll_overlay.addEventListener('mousemove', function(event) {
//   if (scroll_isDragging) {
//       var rect = scroll_bar.getBoundingClientRect();
//       var position = event.clientY - rect.top;
//       let scroll_thumb_height = scroll_thumb.getBoundingClientRect().height
//       if (position >= 0 && position <= (rect.height - scroll_thumb_height - 1)) {
//         scroll_thumb.style.top = position + 'px';
//         let percentage_scroll = position / (rect.height - scroll_thumb_height - 1)
//         let scroll_distance = percentage_scroll * body.scrollHeight
//         window.scrollTo(0, scroll_distance)
//       }
//   }
// });

// scroll_overlay.addEventListener('mouseup', function(event) {
//   scroll_thumb.classList.remove('no-transition');
//   isDragging = false;
//   if (scroll_overlay.parentNode) {
//       scroll_overlay.parentNode.removeChild(scroll_overlay);
//   }
// });

// scroll_overlay.addEventListener('mouseleave', function(event) {
//   scroll_thumb.classList.remove('no-transition');
//   isDragging = false;
//   if (scroll_overlay.parentNode) {
//       scroll_overlay.parentNode.removeChild(scroll_overlay);
//   }
// });



// window.addEventListener('message', function(event) {
//     let receivedVariable = event.data;
//     recieved_current_song = receivedVariable.currentSong;
//     console.log(receivedVariable)
      // recieved_current_song_index = receivedVariable.currentSongId.substring(11);
      // console.log(recieved_current_song_index)

    
    
    // classes_arr[recieved_current_song_index].update();
    // console.log(recieved_current_song_index)
    // classes_arr[recieved_current_song_index].update();
    
    // console.log(recieved_current_song_index)
    // recieved_current_song_index = receivedVariable.index_of_current_song
    // previous_song_index = receivedVariable.index_of_previous_song;
    // current_song_duartion = receivedVariable.duration;
    // isPlaying_ = receivedVariable.isPlaying;
    // timeValue = (receivedVariable.currentTime * 1000)
    // window.addEventListener('DOMContentLoaded', function() {
    //     console.log(receivedVariable)
        
    // });
// });

// let refreshOnFocus; 

// window.onblur = () => {
//   refreshOnFocus = true;
// }

// window.onfocus = () => {
//   if (refreshOnFocus) {
//     refreshOnFocus = false; 
//   }
// }

// window.addEventListener('load', () => {
//     let from_songs = {

//     };
//     from_songs.update_songs_tab = true;
//     window.parent.postMessage(from_songs, '*');
// })

      // const div = document.createElement('div');
      // div.classList.add('single-song');
      // div.id = `song-label-${this.songIndex}`;
      // div.display = 'flex';

      // let checkbox = document.createElement('input');
      // checkbox.type = 'checkbox';
      // checkbox.id = obj.fileName;
      // checkbox.name = 'single-song;'
      // checkbox.classList.add('hide');

      // let song_name = document.createElement('div')
      // let song_name_text = document.createElement('span')
      // song_name_text.classList.add('song-name-text')
      // song_name_text.textContent = `${obj.fileName}`;
      // song_name.classList.add('song-name')
      // song_name.appendChild(song_name_text);

    //   let play_button = document.createElement('button')
    //     play_button.textContent = 'play';
    //     play_button.id = obj.fileName + 'play-button';
    //     play_button.classList = 'play_button'
    //     play_button.addEventListener('mousedown', function(event) {
    //         event.stopPropagation();
    //         playBlock.allsongs = loaded_all_songs;
    //         playBlock.currentSong = obj;
    //         playBlock.currentSongId = div.id;
    //         playBlock.playASong = true;
    //         window.parent.postMessage(playBlock, '*');
    //   });
    // play_button.visibility = 'hidden';

    // let song_artist = document.createElement('div')
    // let artist = obj.artist
    // if(artist === undefined){
    // song_artist.textContent = 'Unknown Artist'
    // song_artist.classList = 'artist'
    // }
    // else if(artist === null){
    // song_artist.textContent = 'Unknown Artist'
    // song_artist.classList = 'artist'
    // }
    // else if(artist === 'null'){
    // song_artist.textContent = 'Unknown Artist'
    // song_artist.classList = 'artist'
    // }
    // else if(artist === 'Unknown'){
    // song_artist.textContent = 'Unknown Artist'
    // song_artist.classList = 'artist'
    // }
    // else if(artist === 'unknown'){
    // song_artist.textContent = 'Unknown Artist'
    // song_artist.classList = 'artist'
    // }
    // else if(artist === 'Unknown Artist'){
    // song_artist.textContent = 'Unknown Artist'
    // song_artist.classList = 'artist'
    // }
    // else if(artist === 'unknown artist'){
    // song_artist.textContent = 'Unknown Artist'
    // song_artist.classList = 'artist'
    // }
    // else if(artist === 'Unknown Artist '){
    // song_artist.textContent = 'Unknown Artist'
    // song_artist.classList = 'artist'
    // } else {
    // const artistNames = obj.artist.split('/');
    // const main_artist = artistNames[0]
    // const contributing_artists = artistNames.slice(1)
    // const formattedArtists = `${main_artist}  <br>ft. ${contributing_artists.join(', ')}`
    // song_artist.innerHTML = formattedArtists;
    // }
    // song_artist.classList.add('artist');

    

    // this.play_button_area.classList = 'play-button-area'
    // // this.play_button_area.style.backgroundColor = 'yellow';
    // this.play_button_area.setAttribute('for', play_button.id)
    // this.play_button_area.addEventListener('mousedown', function(event) {
    // play_button.dispatchEvent(new MouseEvent('mousedown'));
    // })

    // let song_duaration = document.createElement('div')
    //   song_duaration.textContent = `${obj.duration2}`
    //   song_duaration.classList = 'duration'
            
    //   let song_image = document.createElement('img')
    //   song_image.setAttribute('src', '../icons/Artist3.png')
    //   song_image.classList ='song-image'
                       
    //   let visibility_overlay = document.createElement('div');
    //   visibility_overlay.className = 'visibility-overlay';

//     // let song_art = document.createElement('img');
//     // song_art.setAttribute('src', '../icons/songbg2.png');
//     // song_art.classList ='song-art';