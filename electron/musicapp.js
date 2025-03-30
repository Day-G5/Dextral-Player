const { app, BrowserWindow, ipcMain, screen, globalShortcut } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const configPath = path.join(app.getPath("userData"), "config.json");

const defaultBounds = { x: 0, y: 0, width: 800, height: 600 };

const songs_json = './media_files.json';

if (!fs.existsSync(songs_json)) {
  fs.writeFileSync(songs_json, '[]', { flag: 'wx' });
} 

let isMaximized = false;
let beforeMaxBounds;

function createWindow() {
  let windowBounds;
  try {
    windowBounds = JSON.parse(fs.readFileSync(configPath));
  } catch (err) {
    windowBounds = defaultBounds;
  }

  const window = new BrowserWindow({
    x: windowBounds.x,
    y: windowBounds.y,
    width: windowBounds.width,
    height: windowBounds.height,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    movable: true
  });

  window.loadFile('../pages/home.html');

  window.on("resize", saveWindowBounds);
  window.on("move", saveWindowBounds);

  function saveWindowBounds() {
    const bounds = window.getBounds();
    const json = JSON.stringify(bounds);
    fs.writeFileSync(configPath, json);
  }

  ipcMain.on('toggle-window-size', () => {
    if (isMaximized) {

      window.setBounds(beforeMaxBounds);
      isMaximized = false;
      window.setFullScreen(isMaximized);
    } else {
      beforeMaxBounds = window.getBounds();

      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      
      
      // window.setBounds({ x: 0, y: 0, width, height });
      isMaximized = true;
      window.setFullScreen(isMaximized);
    }
  });

  ipcMain.on('minimize-app', () => {
    window.minimize();
  });

  const playPauseSuccess = globalShortcut.register('MediaPlayPause', () => {
    window.webContents.send('play-pause-trigger');
  });

  const nextTrackSuccess = globalShortcut.register('MediaNextTrack', () => {
    window.webContents.send('next-song-trigger');
  });

  const previousTrackSuccess = globalShortcut.register('MediaPreviousTrack', () => {
    window.webContents.send('previous-song-trigger');
  })

  // fs.watch(songs_json, (eventType, filename) => {
  //   if (eventType === 'change') {
  //     window.webContents.send('refresh-iframes');
  //   }
  // });
}

app.whenReady().then(createWindow);

ipcMain.on("close-app", (event, arg) => {
  app.quit();
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length ===   0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// function update_listened_songs () {
//   const command = 'node updatelistened.js'; exec(command, (error, stdout, stderr) => {
//     if (error) {
//         console.error(`exec error: ${error}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
//     console.error(`stderr: ${stderr}`);
// });}

function add_songs () {
  const command = 'electron selectfolder.js'; exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});}

ipcMain.on('update_listened', (event, songTitle) => {
  console.log(`Received song title from renderer process: ${songTitle}`);
  updateSongData(songTitle)
})

ipcMain.on('get-songs', (event, arg) => {
  console.log('Received request to get songs from renderer process');
  add_songs()
})
  function updateSongData(songTitle) {
    fs.readFile('media_files.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            return;
        }

        try {
            const songsData = JSON.parse(data);
            const currentSong = songsData.find(song => song.fileName === songTitle);
            if (currentSong) {
              let num = currentSong.number_of_times_played++;
              console.log(currentSong)
                num++;
                currentSong.number_of_times_played = num;
                console.log(currentSong.number_of_times_played)

                fs.writeFile('media_files.json', JSON.stringify(songsData, null, 4), 'utf8', err => {
                    if (err) {
                        console.error('Error updating the JSON file:', err);
                    } else {
                        console.log(`Updated the current song '${songTitle}' in media_files.json.`);
                    }
                });
            } else {
                console.error(`Song '${songTitle}' not found.`);
            }
        } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
        }
    });
}