const body = document.querySelector('body');

const root = document.querySelector(':root');

let overlay = document.createElement('div');

const navBarPage = localStorage.getItem('navBarPage');
let selectedNavBarPage = localStorage.getItem('selectedNavBarPage');

let isDragging = false;

function createTitleBar () {
    const titleBar = document.createElement('div');
    titleBar.classList.add('title-bar');
    body.appendChild(titleBar);
}

function createContent () {
    const navBar = document.createElement('div');
    navBar.classList.add('nav-bar');

    body.appendChild(navBar);

    createIframe();

    createNavBarItems(navBar);
    loadUnderliner();
}

function createNavBarItems (navBar) {
    const navBarItems = document.createElement('div');
    navBarItems.classList.add('nav-bar-items');
    navBar.appendChild(navBarItems);

    const underliner = document.createElement('div');
    underliner.classList.add('underliner');
    
    navBarItems.appendChild(underliner);

    createHomeButton(navBarItems);
    createQueueButton(navBarItems);
    createPlaylistButton(navBarItems);
}

function createHomeButton (navBarItems) {
    const homeButton = document.createElement('input');
    homeButton.id = 'nav-home-radio';
    homeButton.classList.add('nav-bar-button');
    homeButton.setAttribute('type', 'radio');
    homeButton.setAttribute('name', 'nav-bar-buttons');
    homeButton.setAttribute('value', '0');
    homeButton.setAttribute('srcValue', 'home.html');
    
    navBarItems.appendChild(homeButton);

    const homeLabel = document.createElement('label');
    homeLabel.setAttribute('for', 'nav-home-radio');
    homeLabel.classList.add('nav-button-label');
    homeLabel.id = 'nav-home-label';
    homeLabel.textContent = 'HOME';

    navBarItems.appendChild(homeLabel);

    homeButton.addEventListener('change', () => {
        localStorage.setItem('navBarPage', 'home');
        underliner(homeLabel, selectedNavBarPage, homeButton.value, navBarItems);

        localStorage.setItem('selectedNavBarPage', homeButton.value);
        selectedNavBarPage = homeButton.value;

        const iframe = document.querySelector('iframe');
        iframe.src = homeButton.getAttribute('srcValue');
    });

    if(navBarPage === null || navBarPage === 'home') {
        homeButton.checked = true;
        const event = new Event('change');
        homeButton.dispatchEvent(event);
    }
}

function createQueueButton (navBarItems) {
    const queueButton = document.createElement('input');
    queueButton.id = 'nav-queue-radio';
    queueButton.classList.add('nav-bar-button');
    queueButton.setAttribute('type', 'radio');
    queueButton.setAttribute('name', 'nav-bar-buttons');
    queueButton.setAttribute('value', '1');
    queueButton.setAttribute('srcValue', 'queue.html');

    navBarItems.appendChild(queueButton);

    const queueLabel = document.createElement('label');
    queueLabel.setAttribute('for', 'nav-queue-radio');
    queueLabel.classList.add('nav-button-label');
    queueLabel.id = 'nav-queue-label';
    queueLabel.textContent = 'QUEUE';
    
    navBarItems.appendChild(queueLabel);

    queueButton.addEventListener('change', () => {
        localStorage.setItem('navBarPage', 'queue');
        underliner(queueLabel, selectedNavBarPage, queueButton.value, navBarItems);

        localStorage.setItem('selectedNavBarPage', queueButton.value);
        selectedNavBarPage = queueButton.value;

        const iframe = document.querySelector('iframe');
        iframe.src = queueButton.getAttribute('srcValue');
    });

    if(navBarPage === 'queue') {
        queueButton.checked = true;
        const event = new Event('change');
        queueButton.dispatchEvent(event);
    }
}

function createPlaylistButton (navBarItems) {
    const playlistButton = document.createElement('input');
    playlistButton.id = 'nav-playlist-radio';
    playlistButton.classList.add('nav-bar-button');
    playlistButton.setAttribute('type', 'radio');
    playlistButton.setAttribute('name', 'nav-bar-buttons');
    playlistButton.setAttribute('value', '2');
    playlistButton.setAttribute('srcValue', 'playlist.html');

    navBarItems.appendChild(playlistButton);

    const playlistLabel = document.createElement('label');
    playlistLabel.setAttribute('for', 'nav-playlist-radio');
    playlistLabel.classList.add('nav-button-label');
    playlistLabel.id = 'nav-playlist-label';
    playlistLabel.textContent = 'PLAYLIST';

    navBarItems.appendChild(playlistLabel);

    playlistButton.addEventListener('change', () => {
        localStorage.setItem('navBarPage', 'playlist');
        underliner(playlistLabel, selectedNavBarPage, playlistButton.value, navBarItems);

        localStorage.setItem('selectedNavBarPage', playlistButton.value);
        selectedNavBarPage = playlistButton.value;

        const iframe = document.querySelector('iframe');
        iframe.src = playlistButton.getAttribute('srcValue');
    });

    if(navBarPage === 'playlist') {
        playlistButton.checked = true;
        const event = new Event('change');
        playlistButton.dispatchEvent(event);
    }
}

function loadUnderliner () {
    const underliner = document.querySelector('.underliner');
    underliner.style.left = 0 + 'px';
    underliner.style.right = 100 + '%';

    const navBarItems = document.querySelector('.nav-bar-items');

    const targetIndex = (selectedNavBarPage * 2) + 2;
 
    setTimeout(() => {
        underliner.style.right = navBarItems.offsetWidth - navBarItems.children[targetIndex].offsetLeft - navBarItems.children[targetIndex].offsetWidth + 'px';        
    }, 100);

    setTimeout(() => {
        underliner.style.left = navBarItems.children[targetIndex].offsetLeft + 'px';
    }, 200);
}

function underliner (selectedLabel, oldIndex, newIndex, navBarItems) {
    const underliner = document.querySelector('.underliner');

    if(oldIndex > newIndex){
        //It is moving from right to left
        
        underliner.style.left = selectedLabel.offsetLeft + 'px';
        setTimeout(() => {
            underliner.style.right = navBarItems.offsetWidth - selectedLabel.offsetLeft - selectedLabel.offsetWidth + 'px';
        }, 200);
    }

    if(newIndex > oldIndex){
        //it is moving from left to right
        underliner.style.right = navBarItems.offsetWidth - selectedLabel.offsetLeft - selectedLabel.offsetWidth + 'px';
        
        setTimeout(() => {
            underliner.style.left = selectedLabel.offsetLeft + 'px';
        }, 200);
        
    }
}

function createIframe () {
    const iframe = document.createElement('iframe');
    iframe.id = 'iframe';
    body.appendChild(iframe);
}

function createPlayer () {
    const player = document.createElement('div');
    player.id = 'player';

    const seekBar = document.createElement('input');
    seekBar.id = 'seekBar';
    seekBar.setAttribute('type', 'range');
    seekBar.setAttribute('min', '0');
    seekBar.setAttribute('max', '100');

    //Load the value from local storage
    const value = localStorage.getItem('seekBarValue');
    seekBar.setAttribute('value', value);

    seekBar.addEventListener('input', () => {
        const value = seekBar.value;
        localStorage.setItem('seekBarValue', value);
    });

    const seekBarLabel = document.createElement('div');
    seekBarLabel.id = 'seekBarLabel';

    const seeker = document.createElement('div');
    seeker.id = 'seeker';

    seekBarLabel.appendChild(seeker);

    player.appendChild(seekBar);
    player.appendChild(seekBarLabel);

    body.appendChild(player);

    const seekBarLabelStyle = getComputedStyle(seekBarLabel);

    let seekBarLabelWidth = parseFloat(seekBarLabelStyle.width);

    seeker.style.left = (seekBar.value / 100 * seekBarLabelWidth) + 'px';

    seekBarLabel.addEventListener('mousedown', (e) => {
        console.log('here')
        overlay = document.createElement('div');
        overlay.id = 'overlay';

        body.appendChild(overlay);
        
        isDragging = true;

        const minPosition = 0;
        const maxPosition = seekBarLabelWidth;    

        //Taking into calculation the width of the seekBarLabel and the transform property
        const seekerPosition = Math.min(Math.max(e.x - parseInt(seekBarLabelStyle.left) + (parseInt(seekBarLabelStyle.width) / 2), minPosition), maxPosition); 
        seeker.style.left = seekerPosition + 'px';
        
        seekBar.value = seekerPosition / seekBarLabelWidth * 100;
        localStorage.setItem('seekBarValue', seekBar.value);

        overlay.addEventListener('mousemove', (e) => {
            const seekerPosition = Math.min(Math.max(e.x - parseInt(seekBarLabelStyle.left) + (parseInt(seekBarLabelStyle.width) / 2), minPosition), maxPosition);
            seeker.style.left = seekerPosition + 'px';

            seekBar.value = seekerPosition / seekBarLabelWidth * 100;
            localStorage.setItem('seekBarValue', seekBar.value);
        });

        const removeOverlay = () => {
            if (overlay && overlay.parentNode) {
                body.removeChild(overlay);
            }
            isDragging = false;
            overlay.removeEventListener('mouseup', removeOverlay);
        };
    
        overlay.addEventListener('mouseup', removeOverlay);
        overlay.addEventListener('mouseleave', removeOverlay);
    });

    seeker.addEventListener('mousedown', (e) => {
        isDragging = true;
        const mouseEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: e.clientX,
            clientY: e.clientY
        });
        seekBarLabel.dispatchEvent(mouseEvent);
    });
}

createTitleBar();
createContent();
createPlayer();
