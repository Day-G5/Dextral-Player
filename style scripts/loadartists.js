async function readData() {
    const data = await fetch('../electron/media_files.json');
    const res = await data.json();
    return res;
}

const body = document.getElementById('body')
const artist_container = document.getElementsByClassName('artist-container')[0];
const expanded_single_artist = document.createElement('div');
expanded_single_artist.classList.add('artist-songs');
const single_artists = document.getElementById("single-artists");
const play_pause_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" class="play-pause-svg" id="play-pause-svg"><path class="play-svg" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/><path class="pause-svg" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>';
const collapse_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="collapse-svg"><path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/></svg>'

let playBlock = {}
playBlock.currentSong;
let artist_index = 0;
let recieved_current_song;
let recieved_current_artist_index;
let recieved_previous_artist_index;
let previous_song;
let current_song_duartion;
let current_song_label_id;
let isPlaying_;
let isPaused = true;
let artist_arr = [];
let contributor_arr = [];
let skip_previous_value;
let artist_class;
let artist_object = {
    undefined: {
        songs: [],
        class: []
    },
};
let contributor_object = {
};
let received_song_object = {
};

let artist_tab;

let selected_artist;

let selected_album;


const artist_class_variables = {
    artist_left: 0,
    artist_top: 0,
    artist_left: 0,
    artist_width: 0,
}

class DivCreator {
    constructor(artist){
        this.div = document.createElement('div');
        this.div.classList.add('single-artist');

        const parser = new DOMParser();
        const svgElement = parser.parseFromString(play_pause_svg, 'image/svg+xml');
        const svgCollapse = parser.parseFromString(collapse_svg, 'image/svg+xml');
        this.svgDoc = svgElement.documentElement;
        this.collapseDoc = svgCollapse.documentElement;

        this.play_svg = this.svgDoc.getElementsByClassName('play-svg')[0];
        this.pause_svg = this.svgDoc.getElementsByClassName('pause-svg')[0];

        this.play_button = document.createElement('div');
        this.play_button.classList.add('play_button');

        this.artist_name = document.createElement('div');
        this.artist_name_text = document.createElement('span');
        this.artist_name_text.classList.add('artist-name-text')
        if(artist === 'undefined'){
            this.artist_name_text.textContent = 'Unknown Artist'
        } else {
            this.artist_name_text.textContent = `${artist}`;
        }
        this.artist_name.classList.add('artist-name');

        this.div.addEventListener('click', (event) => {
            event.stopPropagation();
            selected_artist = this.artist_name_text.textContent
            this.expandArtist();
        })

        this.play_button.addEventListener('click', (event) => {
            event.stopPropagation();
                playBlock.source = 'artists'
                let temp;
                let songs_ = [];
                if(this.artist_name_text.textContent === 'Unknown Artist'){
                    temp = artist_object[undefined]
                } else {
                    temp = artist_object[this.artist_name_text.textContent]
                }
                if(temp.songs !== undefined && temp.songs.length > 0){
                    temp.songs.forEach((song) => {
                        songs_.push(song.playInfo())
                    })
                } else {
                    temp.contributed.forEach((song) => {
                        songs_.push(song.playInfo())
                    })
                }
                playBlock.allsongs = songs_
                playBlock.currentSong = playBlock.allsongs[0];
                playBlock.playASong = true;
                playBlock.resume = true;
                playBlock.index = this.index;
                window.parent.postMessage(playBlock, '*');
        })

        this.collapseArtistButton = document.createElement('div');
        this.collapseArtistButton.appendChild(this.collapseDoc)
        this.collapseArtistButton.classList.add('collapse-artist-button');
        this.collapseArtistButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.collapseArtist();
        });

        this.expandArtistArea = document.createElement('div');

        this.play_svg.style.fill = 'white';
        this.pause_svg.style.fill = 'none';
        
        this.artist_name.appendChild(this.artist_name_text);
        this.div.appendChild(this.artist_name);
        this.play_button.appendChild(this.svgDoc);
        this.div.appendChild(this.play_button);
        artist_container.appendChild(this.div)
    }

    // createDiv () {
    // this.artist_name.appendChild(this.artist_name_text);
    // this.div.appendChild(this.artist_name);
    // this.div.appendChild(this.play_button);
    // artist_container.appendChild(this.div)
    // }

    update () {
        if(recieved_current_song){
            if(selected_artist !== undefined && artist_tab !== 'albums' && artist_object[selected_artist][artist_tab] !== undefined){ 
                artist_object[selected_artist][artist_tab].forEach((song) => {
                    if(song.fileName === recieved_current_song.fileName){
                        song.display_class[0].update()
                    }
                    else {
                        song.display_class[0].restore()
                    }
                })
            } else if(selected_album !== undefined){
                artist_object[selected_artist][artist_tab][selected_album].songs.forEach((song) => {
                    if(song.fileName === recieved_current_song.fileName){
                        song.display_class[0].update()
                    } else {
                        song.display_class[0].restore()
                    }
                })
            }        
        }
    }

    expandArtist () {
        artist_container.appendChild(this.expandArtistArea)
        this.expandArtistArea.style.zIndex = '3';

        this.expandArtistArea.classList.add('expand-artist-area');

        let rect = this.div.getBoundingClientRect();
        artist_class_variables.artist_left = rect.left;
        artist_class_variables.artist_top = rect.top;
        artist_class_variables.artist_width = rect.width;
        artist_class_variables.artist_height = rect.height;
        artist_class_variables.scrollTop = artist_container.scrollTop;

        artist_container.style.setProperty('overflow-y', 'hidden');

        this.collapseArtistButton.style.zIndex = '4';

        this.expandArtistArea.style.top = `${rect.top}px`;
        this.expandArtistArea.style.left = `${rect.left}px`;
        this.expandArtistArea.style.width = `350px`;
        this.expandArtistArea.style.height = `120px`;
        this.expandArtistArea.style.position = 'absolute';

        setTimeout(() => {
            this.expandArtistArea.style.top = '0px';
            this.expandArtistArea.style.left = '0px';
            this.expandArtistArea.style.width = `100vw`
            this.expandArtistArea.style.height = `100vh`
            this.expandArtistArea.style.maxHeight = `100vh`
            this.expandArtistArea.style.overflowY = 'auto';
            this.expandArtistArea.style.overflowX = 'hidden';
            this.expandArtistArea.appendChild(this.collapseArtistButton);
        }, 200);

        this.div.removeChild(this.artist_name)
        this.expandArtistArea.appendChild(this.artist_name);

        this.expandedArtistpages_menu = document.createElement('div');
        this.expandedArtistpages_menu.classList.add('expanded-artistpages-menu');
        this.expandedArtistpages_menu.id = `${this.artistIndex}-expanded-artistpages-menu`;
       

        this.all_artist_songs = document.createElement('input');
        this.all_artist_songs.setAttribute('type', 'radio');
        this.all_artist_songs.setAttribute('name', 'expanded-artistpages-menu');
        this.all_artist_songs.setAttribute('value', 'all-artist-songs');
        this.all_artist_songs.setAttribute('checked', 'true');
        this.all_artist_songs.setAttribute('id', 'all-artist-songs');
        this.all_artist_songs.classList.add('display-none');

        this.all_artist_songs_label = document.createElement('label');
        this.all_artist_songs_label.classList.add('all-artist-menu-label');
        this.all_artist_songs_label.setAttribute('for', 'all-artist-songs');
        this.all_artist_songs_label.textContent = 'Songs';

        this.all_artist_albums = document.createElement('input');
        this.all_artist_albums.setAttribute('type', 'radio');
        this.all_artist_albums.setAttribute('name', 'expanded-artistpages-menu');
        this.all_artist_albums.setAttribute('value', 'all-artist-albums');
        this.all_artist_albums.setAttribute('id', 'all-artist-albums');
        this.all_artist_albums.classList.add('display-none');

        this.all_artist_albums_label = document.createElement('label');
        this.all_artist_albums_label.classList.add('all-artist-menu-label');
        this.all_artist_albums_label.setAttribute('for', 'all-artist-albums');
        this.all_artist_albums_label.textContent = 'Albums';

        this.all_artist_contributed = document.createElement('input');
        this.all_artist_contributed.setAttribute('type', 'radio');
        this.all_artist_contributed.setAttribute('name', 'expanded-artistpages-menu');
        this.all_artist_contributed.setAttribute('value', 'all-artist-contributed');
        this.all_artist_contributed.setAttribute('id', 'all-artist-contributed');
        this.all_artist_contributed.classList.add('display-none');

        this.all_artist_contributed_label = document.createElement('label');
        this.all_artist_contributed_label.classList.add('all-artist-menu-label');
        this.all_artist_contributed_label.setAttribute('for', 'all-artist-contributed');
        this.all_artist_contributed_label.textContent = 'Contributed';

        this.expanded_artist_menu_indicator = document.createElement('div');
        this.expanded_artist_menu_indicator.classList.add('expanded-artist-menu-indicator');
        this.updateMenuIndicator(0);
        expanded_single_artist.style.setProperty('align-items', 'center');
        this.appendSongs();
        if(this.artist_name_text.textContent === 'Unknown Artist'){
            selected_artist = 'undefined';
        } else {
        selected_artist = this.artist_name_text.textContent;
        }

        this.all_artist_songs.onchange = () => {
            expanded_single_artist.style.setProperty('align-items', 'center');
            expanded_single_artist.style.paddingLeft = '0';
            if(this.artist_name_text.textContent === 'Unknown Artist'){
                selected_artist = 'undefined';
            } else {
            selected_artist = this.artist_name_text.textContent;
            }
            this.updateMenuIndicator(0);
            expanded_single_artist.querySelectorAll('div').forEach((element) => {
                element.remove();
            });
            this.appendSongs();
            this.update();
        };

        this.all_artist_albums.onchange = () => {
            expanded_single_artist.style.setProperty('align-items', 'flex-start');
            expanded_single_artist.style.paddingLeft = '5%';
            if(this.artist_name_text.textContent === 'Unknown Artist'){
                selected_artist = 'undefined';
            } else {
            selected_artist = this.artist_name_text.textContent;
            }
            this.updateMenuIndicator(1);
            expanded_single_artist.querySelectorAll('div').forEach((element) => {
                element.remove();
            });
            this.appendAlbums();
            this.update();
        };

        this.all_artist_contributed.onchange = () => {
            expanded_single_artist.style.setProperty('align-items', 'center');
            expanded_single_artist.style.paddingLeft = '0';
            if(this.artist_name_text.textContent === 'Unknown Artist'){
                selected_artist = 'undefined';
            } else {
            selected_artist = this.artist_name_text.textContent;
            }
            this.updateMenuIndicator(2);
            expanded_single_artist.querySelectorAll('div').forEach((element) => {
                element.remove();
            });
            this.appendContributed();
            this.update();
        };

        setTimeout(() => {
        this.expandedArtistpages_menu.appendChild(this.expanded_artist_menu_indicator);
        this.expandedArtistpages_menu.appendChild(this.all_artist_songs);
        this.expandedArtistpages_menu.appendChild(this.all_artist_albums);
        this.expandedArtistpages_menu.appendChild(this.all_artist_contributed);
        this.expandedArtistpages_menu.appendChild(this.all_artist_songs_label);
        this.expandedArtistpages_menu.appendChild(this.all_artist_albums_label);
        this.expandedArtistpages_menu.appendChild(this.all_artist_contributed_label);
        this.expandArtistArea.appendChild(expanded_single_artist);
        this.expandArtistArea.appendChild(this.expandedArtistpages_menu);
    }, 250);
        this.update(received_song_object);
    }

    appendSongs () {
        artist_tab = 'songs';
        if(this.artist_name_text.textContent === 'Unknown Artist'){
            artist_object[undefined].songs.forEach((song) => {
                song.display_class = []
                song.display_class.push(new artistSongs(song));
            })
        } else {
            artist_object[this.artist_name_text.textContent].songs.forEach((song) => {
                song.display_class = []
                song.display_class.push(new artistSongs(song));
                })
        }
    }

    appendContributed () {
        artist_tab = 'contributed';
        if(this.artist_name_text.textContent !== 'Unknown Artist'){
            artist_object[this.artist_name_text.textContent].contributed.forEach((song) => {
                song.display_class = []
                song.display_class.push(new contributorSongs(song));
            })
        }
    }

    appendAlbums () {
        artist_tab = 'albums';
        if(this.artist_name_text.textContent !== 'Unknown Artist'){
            Object.keys(artist_object[this.artist_name_text.textContent].albums).forEach((album) => {
                artist_object[this.artist_name_text.textContent].albums[album].display_class = []
                artist_object[this.artist_name_text.textContent].albums[album].display_class.push(new artistAlbums (album));
            })
        }
    }
    
    collapseArtist () {
        artist_container.style.setProperty('overflow-y', 'auto');
        artist_container.scrollTo(0, artist_class_variables.scrollTop);

        this.expandArtistArea.style.top = artist_class_variables.artist_top + 'px';
        this.expandArtistArea.style.left = artist_class_variables.artist_left + 'px';
        this.expandArtistArea.style.width = `350px`
        this.expandArtistArea.style.height = `120px`;   
        
        // setTimeout(() => {
        //     artist_container.removeChild(this.expandArtistArea);
        // }, 250);

        selected_artist = undefined;
        this.expandArtistArea.removeChild(this.expandedArtistpages_menu);

        setTimeout(() => {
            artist_container.removeChild(this.expandArtistArea);
            this.expandArtistArea.removeChild(this.artist_name);
            this.div.appendChild(this.artist_name);
        }, 100);

        this.expandArtistArea.removeChild(expanded_single_artist);
        expanded_single_artist.querySelectorAll('div').forEach((element) => {
            element.remove();
        });
    }

    expandedArtistpages () {
        this.expandedArtistpages_menu = document.createElement('div');
        this.expandedArtistpages_menu.classList.add('expanded-artistpages-menu');
        this.expandArtistArea.appendChild(this.expandedArtistpages_menu);

        this.all_artist_songs = document.createElement('input[type=radio]');
        this.all_artist_songs.name = 'expanded-artistpages-menu';
        this.all_artist_songs.value = 'all-artist-songs';

        this.all_artist_albums = document.createElement('input[type=radio]');
        this.all_artist_albums.name = 'expanded-artistpages-menu';
        this.all_artist_albums.value = 'all-artist-albums';

        this.all_artist_contributed = document.createElement('input[type=radio]');
        this.all_artist_contributed.name = 'expanded-artistpages-menu';
        this.all_artist_contributed.value = 'all-artist-contributed';

        this.expandedArtistpages_menu.appendChild(this.all_artist_songs);
        this.expandedArtistpages_menu.appendChild(this.all_artist_albums);
        this.expandedArtistpages_menu.appendChild(this.all_artist_contributed);
    }

    receiveMessage () {
        this.update(received_song_object);
    }

    updateMenuIndicator (i) {
        let rect = this.expandedArtistpages_menu.getBoundingClientRect();
        let rect_songs = this.all_artist_songs.getBoundingClientRect();
        let rect_albums = this.all_artist_albums.getBoundingClientRect();
        let rect_contributed = this.all_artist_contributed.getBoundingClientRect();
        let rect_indicator = this.expanded_artist_menu_indicator.getBoundingClientRect();

        if(i > this.artist_expanded_menu_value) {
            this.expanded_artist_menu_indicator.style.width = `${((i - this.artist_expanded_menu_value) * 100) + 60}px`;

            setTimeout(() => {
                this.expanded_artist_menu_indicator.style.width = `60px`;
                this.expanded_artist_menu_indicator.style.left = `${(100 * i) + 20}px`;
            }, 200)
        }

        if(i < this.artist_expanded_menu_value) {
            this.expanded_artist_menu_indicator.style.left = `${(100 * i) + 20}px`;
            this.expanded_artist_menu_indicator.style.width = `${((this.artist_expanded_menu_value - i) * 100) + 60}px`;

            setTimeout(() => {
                this.expanded_artist_menu_indicator.style.width = `60px`;
            }, 200)
        }

        this.artist_expanded_menu_value = i
    }
}

class artistSongs {
    constructor (song) {
            this.song_div = document.createElement('div');
            this.song_div.classList.add('song');
            this.song_id = song.fileName;

            const parser = new DOMParser();
            const svgElement = parser.parseFromString(play_pause_svg, 'image/svg+xml');
            this.svgDoc = svgElement.documentElement;

            this.play_svg = this.svgDoc.getElementsByClassName('play-svg')[0];
            this.pause_svg = this.svgDoc.getElementsByClassName('pause-svg')[0];

            this.play_svg.style.fill = 'white';
            this.pause_svg.style.fill = 'none';

            this.song_name = document.createElement('div');
            this.song_name_text = document.createElement('span');
            this.song_name_text.textContent = song.fileName;

            this.song_duaration = document.createElement('div');
            this.song_duaration.classList.add('song_duration');
            // this.song_duaration.style.backgroundColor = 'yellow'
            this.song_duaration_text = document.createElement('span');
            this.song_duaration_text.textContent = song.duration2;
            this.song_duaration.appendChild(this.song_duaration_text);

 
            this.play_button_label = document.createElement('label');
            this.play_button_label.appendChild(this.svgDoc);
            this.play_button_label.classList.add('play_button_label');
            
            this.play_button_label.onclick = () => {  
                playBlock.source = 'artists'

                playBlock.allsongs = [];
                let temp = [...artist_object[selected_artist].songs]
                temp.forEach((song_) => {
                let obj = Object.assign({}, song_);
                obj = JSON.parse(JSON.stringify(obj));
                obj.display_class = undefined;
                playBlock.allsongs.push(obj);
            })

            playBlock.currentSong = JSON.parse(JSON.stringify(song))
            playBlock.currentSong.display_class = undefined;
                playBlock.playASong = true;
                playBlock.resume = false;
                playBlock.index = this.index;
                window.parent.postMessage(playBlock, '*');
            }

            this.song_name.appendChild(this.song_name_text);
            this.song_div.appendChild(this.song_name);
            this.song_div.appendChild(this.song_duaration);
            this.song_div.appendChild(this.play_button_label);
            expanded_single_artist.appendChild(this.song_div);
    }
    
    update () {
        // this.play_button_label.style.backgroundColor = 'green';
        this.play_svg.style.fill = 'none';
        this.pause_svg.style.fill = 'white';
    }

    restore () {
        // this.play_button_label.style.backgroundColor = 'yellow'
        this.play_svg.style.fill = 'white';
        this.pause_svg.style.fill = 'none';
    }
}

class contributorSongs {
    constructor (song) {
        this.container = document.getElementsByClassName('artist-songs')[0];
        this.song_div = document.createElement('div');
        this.song_div.classList.add('song');
        this.song_id = song.fileName;

        const parser = new DOMParser();
        const svgElement = parser.parseFromString(play_pause_svg, 'image/svg+xml');
        this.svgDoc = svgElement.documentElement;

        this.play_svg = this.svgDoc.getElementsByClassName('play-svg')[0];
        this.pause_svg = this.svgDoc.getElementsByClassName('pause-svg')[0];

        this.play_svg.style.fill = 'white';
        this.pause_svg.style.fill = 'none';

        this.song_name = document.createElement('div');
        this.song_name_text = document.createElement('span');
        this.song_name_text.textContent = song.fileName;

        this.song_duaration = document.createElement('div');
        this.song_duaration.classList.add('song_duration');
        this.song_duaration_text = document.createElement('span');
        this.song_duaration_text.textContent = song.duration2;
        this.song_duaration.appendChild(this.song_duaration_text);


        this.play_button_label = document.createElement('label');
        this.play_button_label.appendChild(this.svgDoc);
        this.play_button_label.classList.add('play_button_label');
        
        this.play_button_label.onclick = () => {    
            playBlock.source = 'artists';
            playBlock.allsongs = []
            let temp = [...artist_object[selected_artist].contributed]
            temp.forEach((song_) => {
                let obj = Object.assign({}, song_);
                obj = JSON.parse(JSON.stringify(obj));
                obj.display_class = undefined;
                playBlock.allsongs.push(obj);
            })

            playBlock.currentSong = JSON.parse(JSON.stringify(song))
            playBlock.currentSong.display_class = undefined;
            
            playBlock.playASong = true;
            playBlock.resume = false;
            window.parent.postMessage(playBlock, '*');
        }

        this.song_name.appendChild(this.song_name_text);
        this.song_div.appendChild(this.song_name);
        this.song_div.appendChild(this.song_duaration);
        this.song_div.appendChild(this.play_button_label);
        this.container.appendChild(this.song_div);
}

    update () {
        // this.play_button_label.style.backgroundColor = 'green';
        this.play_svg.style.fill = 'none';
        this.pause_svg.style.fill = 'white';
    }

    restore () {
        // this.play_button_label.style.backgroundColor = 'yellow';
        this.play_svg.style.fill = 'white';
        this.pause_svg.style.fill = 'none';
    }
}

class artistAlbums {
    constructor (album_name) {
        this.album_div = document.createElement('div');
        this.album_div.classList.add('album');

        const parser = new DOMParser();
        const svgElement = parser.parseFromString(play_pause_svg, 'image/svg+xml');
        const svgCollapse = parser.parseFromString(collapse_svg, 'image/svg+xml');
        this.svgDoc = svgElement.documentElement;
        this.collapseDoc = svgCollapse.documentElement;

        this.play_svg = this.svgDoc.getElementsByClassName('play-svg')[0];
        this.pause_svg = this.svgDoc.getElementsByClassName('pause-svg')[0];

        this.play_svg.style.fill = 'white';
        this.pause_svg.style.fill = 'none';

        this.album_name = document.createElement('div');
        this.album_name.classList.add('album-name');
        this.album_name_text = document.createElement('span');
        this.album_name_text.textContent = album_name;


        this.collapse_button = document.createElement('div');
        this.collapse_button.classList.add('collapse-button');
        this.collapse_button.appendChild(this.collapseDoc)

        this.collapse_button.onclick = (event) => {
            event.stopPropagation();
            this.collapse();
        }

        this.album_name.appendChild(this.album_name_text)
        this.album_div.appendChild(this.album_name);
        expanded_single_artist.appendChild(this.album_div);

        expanded_single_artist.style.setProperty('align-items', 'flex-start');

        this.album_div.addEventListener('click', (event) => {
            event.stopPropagation();
            this.expand();
        })
        
    }

    expand () {
        selected_album = this.album_name_text.textContent;
        let rect = expanded_single_artist.getBoundingClientRect();

        this.album_div.style.zIndex = 3;
        this.album_div.style.position = 'absolute';
        // this.album_div.style.display = 'flex'
        this.album_div.style.width = '100%';
        this.album_div.style.height = `100%`;
        this.album_div.style.margin = '0px';
        this.album_div.style.top = '0%';
        this.album_div.style.left = '0%';
        
        setTimeout(() => {
            this.album_div.appendChild(this.collapse_button);
        }, 200);

        this.songs();

        artist_object[selected_artist][artist_tab][selected_album].songs.forEach((song) => {
            if(song.fileName === recieved_current_song.fileName){
                song.display_class[0].update()
            }
            else {
                song.display_class[0].restore()
            }
        })
    }

    collapse () {
        selected_album = undefined;
        // expanded_single_artist.style.setProperty('flex-direction', 'row');
        this.album_div.style.zIndex = 1
        this.album_div.style.position = 'relative';
        this.album_div.style.width = '200px';
        this.album_div.style.height = '100px';
        this.album_div.style.margin = '10px';
        this.album_div.removeChild(this.collapse_button);
        this.album_div.style.position = 'relative';

        this.album_div.querySelectorAll('.song').forEach((element) => {
            element.remove()
        });
    }

    songs () {
        artist_object[selected_artist].albums[this.album_name_text.textContent].songs.forEach((song) => {
            song.display_class.pop();
            song.display_class.push(new albumSongs(song));
        })
    }

    update () {
        this.play_svg.style.fill = 'none';
        this.pause_svg.style.fill = 'white';
    }

    restore () {
        this.play_svg.style.fill = 'white';
        this.pause_svg.style.fill = 'none';
    }
}

class albumSongs {
    constructor (song) {
        this.song_div = document.createElement('div');
            this.song_div.classList.add('song');
            this.song_id = song.fileName;

            const parser = new DOMParser();
            const svgElement = parser.parseFromString(play_pause_svg, 'image/svg+xml');
            this.svgDoc = svgElement.documentElement;

            this.play_svg = this.svgDoc.getElementsByClassName('play-svg')[0];
            this.pause_svg = this.svgDoc.getElementsByClassName('pause-svg')[0];

            this.song_name = document.createElement('div');
            this.song_name_text = document.createElement('span');
            this.song_name_text.textContent = song.fileName;

            this.song_duaration = document.createElement('div');
            this.song_duaration.classList.add('song_duration')
            this.song_duaration_text = document.createElement('span');
            this.song_duaration_text.textContent = song.duration2;
            this.song_duaration.appendChild(this.song_duaration_text);

 
            this.play_button_label = document.createElement('label');
            this.play_button_label.classList.add('play_button_label');
            
            this.play_button_label.onclick = (event) => {
                event.stopPropagation();
                playBlock.source = 'artists'
                playBlock.allsongs = [];
                let temp = artist_object[selected_artist].albums[selected_album].songs
                temp.forEach((song_) => {
                playBlock.allsongs.push(song_.playInfo());
                playBlock.currentSong = song.playInfo();
                playBlock.playASong = true;
                playBlock.resume = false;
                playBlock.index = this.index;
                window.parent.postMessage(playBlock, '*');
            })

            
        }

        this.song_name.appendChild(this.song_name_text);
        this.song_div.appendChild(this.song_name);
        this.song_div.appendChild(this.song_duaration);
        this.play_button_label.appendChild(this.svgDoc);
        this.song_div.appendChild(this.play_button_label);    
        
        let album_ = expanded_single_artist.getElementsByClassName('album')

        Array.from(album_).forEach((album, i) => {
            if(album.style.width === '100%'){
            album.appendChild(this.song_div)
            }
        })

        expanded_single_artist.style.setProperty('flex-direction', 'column');
        }
    
        update () {
            // this.play_button_label.style.backgroundColor = 'green';
            this.play_svg.style.fill = 'none';
            this.pause_svg.style.fill = 'white';
        }
    
        restore () {
            // this.play_button_label.style.backgroundColor = 'yellow';
            this.play_svg.style.fill = 'white';
            this.pause_svg.style.fill = 'none';
        }
}

readData().then((data) => {
    data.forEach((song) => {
        song.playInfo = function () {
            return {
                fileName: this.fileName,
                artist: this.artist,
                location: this.location,
                title: this.title,
                covers: this.covers,
            }
        }
        if (song.artist === undefined) {
            artist_object.undefined.songs.push(song);
        } else {
            song.artist.split('/').forEach((artist, i) => {
                if(artist.match(/,|ft|fT|FT|Ft|ft.|fT.|FT.|Ft./g)) {
                    let further_splitted = artist.split(/,|ft|fT|FT|Ft|ft.|fT.|FT.|Ft./g);
                    further_splitted.forEach((artist_, i) => {
                        if(!artist_object.hasOwnProperty(artist_)){
                            artist_object[artist_] = {
                                songs: [],
                                albums:  {},
                                contributed: [],
                                class: []
                            }
                        }
                        if(i === 0) {
                            artist_object[artist_].songs.push(song);
                            if(song.album){
                                if(!artist_object[artist_].albums.hasOwnProperty(song.album)){
                                    artist_object[artist_].albums[song.album] = { songs: []};
                                }
                                artist_object[artist_].albums[song.album].songs.push(song)
                                artist_object[artist_].albums[song.album].allsongs = []
                            }
                        } else {
                            artist_object[artist_].contributed.push(song);
                        }
                    })
                } else {
                    if(!artist_object.hasOwnProperty(artist)){
                        artist_object[artist] = {
                            songs: [],
                            albums:  {},
                            contributed: [],
                            class: []
                        }
                    }
                    if(i === 0) {
                        artist_object[artist].songs.push(song);
                        if(song.album){
                            if(!artist_object[artist].albums.hasOwnProperty(song.album)){
                                artist_object[artist].albums[song.album] = { songs: []};
                            }
                            artist_object[artist].albums[song.album].songs.push(song)
                            artist_object[artist].albums[song.album].allsongs = []
                        }
                    } else {
                        artist_object[artist].contributed.push(song);
                    }
                }
                
            })
        }
    });
}).then(() => {
    Object.keys(artist_object).forEach((artist) => {
        artist_object[artist].class.push(new DivCreator(artist));
    })
});

window.addEventListener('message', function (event) {
    recieved_current_song = event.data;

    if(selected_artist !== undefined && artist_tab !== 'albums' && artist_object[selected_artist][artist_tab] !== undefined){ 
        artist_object[selected_artist][artist_tab].forEach((song) => {
            if(song.fileName === recieved_current_song.fileName){
                song.display_class[0].update();
                if(recieved_current_song.isPlaying === false){
                    song.display_class[0].restore();
                }
            }
            else {
                song.display_class[0].restore()
            }
        })
    } else if(selected_album !== undefined){
        artist_object[selected_artist][artist_tab][selected_album].songs.forEach((song) => {
            if(song.fileName === recieved_current_song.fileName){
                console.log(song.display_class)
                song.display_class[0].update();
                if(recieved_current_song.isPlaying === false){
                    song.display_class[0].restore();
                }
            }
            else {
                song.display_class[0].restore()
            }
        })
    }
    
    // if(selected_album !== undefined){
    //     artist_object[selected_artist][artist_tab][selected_album].songs.forEach((song) => {
    //         if(song.fileName === recieved_current_song.fileName){
    //             song.display_class[0].update()
    //         }
    //         else {
    //             // song.display_class[0].restore()
    //         }
    //     })
    // } else if (selected_artist !== undefined) {
    //     artist_object[selected_artist][artist_tab].forEach((song) => {
    //         if(song.fileName === recieved_current_song.fileName){
    //             song.display_class[0].update()
    //         }
    //         else {
    //             song.display_class[0].restore()
    //         }
    //     })
    // }
    
    // artist_arr.forEach((artist) => {
    //     if(artist.artist_name_text.textContent === selected_artist){
    //         artist.receiveMessage()
    //     }
    // })
    // contributor_arr.forEach((artist) => {
    //     if(artist.artist_name_text.textContent === selected_artist){
    //         artist.receiveMessage();
    //     }
    // })
});

window.addEventListener('load', () => {
    let from_artists = {

    };
    from_artists.update_songs_tab = true;
    window.parent.postMessage(from_artists, '*');
})