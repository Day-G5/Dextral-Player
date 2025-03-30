// Setting Variables
const music_nav = document.getElementsByClassName('song-nav')[0]
const music_tab_underline = document.getElementsByClassName('music-tab-underline')[0]
const music_nav_radio = document.getElementsByClassName('music-nav-radio')
const music_nav_radio_label = document.getElementsByClassName('label')
const iframe = document.getElementById('music-iframe')
let current_tab;

const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
let directoryPath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
directoryPath = directoryPath.substring(0, directoryPath.lastIndexOf('/'));

// Load previous sessions

const load_music_nav_underline = () => {
    let pre_tab = localStorage.getItem('music-previous-tab');
    if(pre_tab === null){
        localStorage.setItem('music-previous-tab', 0)
        pre_tab = localStorage.getItem('music-previous-tab')
    };

    music_nav_radio[pre_tab].checked = 'checked'
    music_tab_underline.style.height = '30px';
    let current_label_top = music_nav_radio_label[pre_tab].getBoundingClientRect().top;
    
    music_tab_underline.style.top = current_label_top + 'px';

    // Load tab
    iframe.src = music_nav_radio[pre_tab].value
}
addEventListener('DOMContentLoaded', load_music_nav_underline)

for(let i = 0; i < music_nav_radio.length; i++){
    if(music_nav_radio[i].checked){
        current_tab = i;
        break;
    }
};


// Changing Tabs

const change_tabs = () => {
    // Setting current tab
    let music_previous_tab = localStorage.getItem('music-previous-tab')
    for(let i = 0; i < music_nav_radio.length; i++){
        if(music_nav_radio[i].checked){
            current_tab = i;
            break;
        }
    };

    // iframe loading

    iframe.src = music_nav_radio[current_tab].value

    // Tab animation
    
    let tabs_to_travel = Math.abs(music_previous_tab - current_tab);
    let distance_to_travel = 35 * tabs_to_travel;
    distance_to_travel = distance_to_travel + 30;

    let previous_label_top = music_nav_radio_label[music_previous_tab].getBoundingClientRect().top;
    let current_label_top = music_nav_radio_label[current_tab].getBoundingClientRect().top;


    if(current_tab > music_previous_tab){
        music_tab_underline.style.top = previous_label_top + 'px';
        music_tab_underline.style.height = distance_to_travel + 'px';

        // Delay
        setTimeout(() => {
            music_tab_underline.style.top = current_label_top + 'px';
            music_tab_underline.style.height = '30px';
            localStorage.setItem("music-previous-tab", current_tab);
        }, 250)
    };

    if(current_tab < music_previous_tab){
        music_tab_underline.style.height = distance_to_travel + 'px';
        music_tab_underline.style.top = current_label_top + 'px';
        
        // Delay
        setTimeout(() => {
            music_tab_underline.style.height = '30px';
            localStorage.setItem("music-previous-tab", current_tab);
        }, 250)
    };    
    
}

let to_Music;

// Listen for song info
window.addEventListener('message', function(event) {
    let receivedVariable = event.data;
    if(receivedVariable.source === 'allSongs' || receivedVariable.source === 'artists'){
        this.window.parent.postMessage(receivedVariable, '*');
    } else if (receivedVariable.hasOwnProperty('update_songs_tab')) {
       iframe.contentWindow.postMessage(to_Music, '*');
    } else {
        iframe.contentWindow.postMessage(receivedVariable, '*');
        if(receivedVariable.hasOwnProperty('fileName')){
            to_Music = receivedVariable;
            to_Music.update = true
        }
    }
});

iframe.addEventListener('load', () => {
    // iframe.contentWindow.postMessage(to_Music, '*');
})
