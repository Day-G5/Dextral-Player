const body = document.querySelector('body');

const root = document.querySelector(':root');

const homePage = localStorage.getItem('homePage');
let selectedHomePage = localStorage.getItem('selectedHomePage');

function createHomeMenu () {
    const homeMenu = document.createElement('div');
    homeMenu.id = 'home-menu';

    body.appendChild(homeMenu);

    createIframe();

    createHomeMenuItems(homeMenu);
    loadUnderliner();
}

function createHomeMenuItems (homeMenu) {
    const homeMenuItems = document.createElement('div');
    homeMenuItems.classList.add('home-menu-items');
    homeMenu.appendChild(homeMenuItems);

    const homeUnderliner = document.createElement('div');
    homeUnderliner.id = 'home-underliner';

    homeMenuItems.appendChild(homeUnderliner);

    createSongsButton(homeMenuItems);
    createArtistsButton(homeMenuItems);
    createPlaylistButton(homeMenuItems);
}

function createSongsButton (homeMenuItems) {
    const songsButton = document.createElement('input');
    songsButton.id = 'home-songs-radio';
    songsButton.classList.add('home-menu-button');
    songsButton.setAttribute('type', 'radio');
    songsButton.setAttribute('name', 'home-menu-buttons');
    songsButton.setAttribute('value', '0');
    songsButton.setAttribute('srcValue', 'songs.html');

    homeMenuItems.appendChild(songsButton);

    const songsLabel = document.createElement('label');
    songsLabel.id = 'home-songs-label';
    songsLabel.setAttribute('for', 'home-songs-radio');
    songsLabel.textContent = 'Songs';
    songsLabel.classList.add('home-menu-button-label');

    homeMenuItems.appendChild(songsLabel);

    songsButton.addEventListener('change', () => {
        localStorage.setItem('homePage', 'songs');
        underliner(songsLabel, selectedHomePage, songsButton.value, homeMenuItems);
    
        localStorage.setItem('selectedHomePage', songsButton.value);
        selectedHomePage = songsButton.value;

        const iframe = document.querySelector('#home-iframe');
        iframe.src = songsButton.getAttribute('srcValue');
    });

    if(selectedHomePage === 'songs' || selectedHomePage === null){ {
        songsButton.checked = true;
        const event = new Event('change');
        songsButton.dispatchEvent(event);
    }
    }

}

function createArtistsButton (homeMenuItems) {
    const artistsButton = document.createElement('input');
    artistsButton.id = 'home-artists-radio';
    artistsButton.classList.add('home-menu-button');
    artistsButton.setAttribute('type', 'radio');
    artistsButton.setAttribute('name', 'home-menu-buttons');
    artistsButton.setAttribute('value', '1');
    artistsButton.setAttribute('srcValue', 'artists.html');

    homeMenuItems.appendChild(artistsButton);

    const artistsLabel = document.createElement('label');
    artistsLabel.id = 'home-artists-label';
    artistsLabel.setAttribute('for', 'home-artists-radio');
    artistsLabel.textContent = 'Artists';
    artistsLabel.classList.add('home-menu-button-label');

    homeMenuItems.appendChild(artistsLabel);

    artistsButton.addEventListener('change', () => {
        localStorage.setItem('homePage', 'artists');
        underliner(artistsLabel, selectedHomePage, artistsButton.value, homeMenuItems);

        localStorage.setItem('selectedHomePage', artistsButton.value);
        selectedHomePage = artistsButton.value;

        const iframe = document.querySelector('#home-iframe');
        iframe.src = artistsButton.getAttribute('srcValue');
    });

    if(selectedHomePage === 'artists') {
        artistsButton.checked = true;
        const event = new Event('change');
        artistsButton.dispatchEvent(event);
    }
}

function createPlaylistButton (homeMenuItems) {
    const playlistButton = document.createElement('input');
    playlistButton.id = 'home-playlist-radio';
    playlistButton.classList.add('home-menu-button');
    playlistButton.setAttribute('type', 'radio');
    playlistButton.setAttribute('name', 'home-menu-buttons');
    playlistButton.setAttribute('value', '2');
    playlistButton.setAttribute('srcValue', 'playlist.html');

    homeMenuItems.appendChild(playlistButton);

    const playlistLabel = document.createElement('label');
    playlistLabel.id = 'home-playlist-label';
    playlistLabel.setAttribute('for', 'home-playlist-radio');
    playlistLabel.textContent = 'Playlist';
    playlistLabel.classList.add('home-menu-button-label');

    homeMenuItems.appendChild(playlistLabel);

    playlistButton.addEventListener('change', () => {
        localStorage.setItem('homePage', 'playlist');
        underliner(playlistLabel, selectedHomePage, playlistButton.value, homeMenuItems);

        localStorage.setItem('selectedHomePage', playlistButton.value);
        selectedHomePage = playlistButton.value;

        const iframe = document.querySelector('#home-iframe');
        iframe.src = playlistButton.getAttribute('srcValue');
    });

    if(selectedHomePage === 'playlist') {
        playlistButton.checked = true;
        const event = new Event('change');
        playlistButton.dispatchEvent(event);
    }
}

function loadUnderliner () {
    const underliner = document.querySelector('#home-underliner');
    underliner.style.top = 0 + 'px';
    underliner.style.bottom = 100 + '%';

    const homeItems = document.querySelector('.home-menu-items');

    const targetIndex = (selectedHomePage * 2) + 2;

    console.log(targetIndex);
 
    setTimeout(() => {
        underliner.style.bottom = homeItems.offsetHeight - homeItems.children[targetIndex].offsetTop - homeItems.children[targetIndex].offsetHeight + 'px';        
    }, 100);

    setTimeout(() => {
        underliner.style.top = homeItems.children[targetIndex].offsetTop + 'px';
    }, 200);
}

function underliner (selectedLabel, oldIndex, newIndex, homeItems) {
    console.log(selectedLabel, oldIndex, newIndex, homeItems);
    const underliner = document.querySelector('#home-underliner');

    if(oldIndex > newIndex){
        //It is moving from bottom to top
        
        underliner.style.top = selectedLabel.offsetTop + 'px';
        setTimeout(() => {
            underliner.style.bottom = homeItems.offsetHeight - selectedLabel.offsetTop - selectedLabel.offsetHeight + 'px';
        }, 200);
    }

    if(newIndex > oldIndex){
        //it is moving from top to bottom
        underliner.style.bottom = homeItems.offsetHeight - selectedLabel.offsetTop - selectedLabel.offsetHeight + 'px';
        
        setTimeout(() => {
            underliner.style.top = selectedLabel.offsetTop + 'px';
        }, 200);
        
    }
}

function createIframe () {
    const iframe = document.createElement('iframe');
    iframe.id = 'home-iframe';
    body.appendChild(iframe);
}

createHomeMenu();
