const { ipcRenderer, remote } = require("electron");

const close_app_button = document.getElementById("close-app");
const listened_to_song_button = document.getElementById("listened_to_song")
const add_songs = document.getElementById("get-songs");
const maximize_button = document.getElementById("maximize-app");
const minimize_button = document.getElementById("minimize-app");


const play_pause_label = document.getElementsByClassName("play-pause")[0];

close_app_button.addEventListener("click", () => {
  ipcRenderer.send("close-app");
});

maximize_button.addEventListener("click", () => {
  ipcRenderer.send("toggle-window-size")
})

minimize_button.addEventListener('click', () => {
  ipcRenderer.send('minimize-app');
});

listened_to_song_button.addEventListener("click", () => {
  let currentSongTitle = listened_to_song_button.value;
  console.log(currentSongTitle)
  // Emit the "update_listened" event with the current song title
  ipcRenderer.send("update_listened", currentSongTitle);
});

add_songs.addEventListener("click", () => {
  ipcRenderer.send("get-songs");
});

ipcRenderer.on('play-pause-trigger', () => {
  play_pause_label.click();
});

ipcRenderer.on('next-song-trigger', () => {
  next_song_button.click();
});

ipcRenderer.on('previous-song-trigger', () => {
  previous_song_button.click();
});

ipcRenderer.on('refresh-iframes', () => {
  iframe.src = iframe.src;
});