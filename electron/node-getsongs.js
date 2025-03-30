const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

const folderPathsObject = require('./song_folders.json');
const folderPaths = Object.values(folderPathsObject);
const outputPath = '../covers/';
const resolvedOutputPath = path.resolve(outputPath);
if (!fs.existsSync(resolvedOutputPath)) {
  fs.mkdirSync(resolvedOutputPath);
} else {
}

const subfolderNames = ['song_cover', 'album_cover', 'artist_cover', 'other_cover'];

let cover_song_location;
let cover_album_location;
let cover_artist_location;
let cover_other_location;

subfolderNames.forEach(subfolderName => {
  const subfolderPath = path.join(resolvedOutputPath, subfolderName);
  if(subfolderName =='song_cover'){
    cover_song_location = subfolderPath;
  };
  if(subfolderName == 'album_cover'){
    cover_album_location = subfolderPath;
  };
  if(subfolderName == 'artist_cover'){
    cover_artist_location = subfolderPath;
  };
  if(subfolderName == 'other_cover'){
    cover_other_location = subfolderPath;
  }
  if (!fs.existsSync(subfolderPath)) {
      fs.mkdirSync(subfolderPath);
  } else {
  }
});


let id = 0;

// Step 1: Read the existing media_files.json file and parse its contents
let existingFiles = [];
try {
 const data = fs.readFileSync('./media_files.json', 'utf8');
 existingFiles = JSON.parse(data);
} catch (err) {
 console.log("No existing media_files.json found. Starting fresh.");
}

// Step 2: Create a set for quick lookup
const existingFileNames = new Set(existingFiles.map(file => file.fileName));

folderPaths.forEach(folderPath => {
 fs.readdir(folderPath, async (err, files) => {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    };

// Add allowed audio formats in the following block
    const mp3Files = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.mp3' || ext === '.wav' || ext === '.flac' || ext === '.aac';
    });

    const fileNames = [];

    for (let file of mp3Files) {
      id++
      const filePath = path.resolve(folderPath, file);
      const fileName = path.parse(file).name;


      // Step 3: Check if the file already exists
      if (existingFileNames.has(fileName)) {
        continue; // Skip this file
      }

      // Get file info
      const metadata = await mm.parseFile(filePath);
      const title = metadata.common.title;
      const song_cover = metadata.common.picture;
      let cover;
      let coverBuffer;
      let cover_song;
      let cover_album;
      let cover_artist;
      if(song_cover){
        song_cover.forEach(element => {
          if(element.type == 'front cover'){
            cover_song = path.join(cover_song_location, fileName + '.jpg');
            coverBuffer = song_cover ? Buffer.from(element.data) : null;
            fs.writeFile(cover_song, coverBuffer, (err) => {
              if(err) {
                console.error("Error writing file", err);
              } else {
              }
            })
          }
          if(element.type == 'album cover'){
            cover_album = path.join(cover_album_location, fileName + '.jpg');
            coverBuffer = song_cover ? Buffer.from(element.data) : null;
            fs.writeFile(cover_album, coverBuffer, (err) => {
              if(err) {
                console.error("Error writing file", err);
              } else {
              }
            })
          }
          if(element.type == 'artist'){
            cover_artist = path.join(cover_artist_location, fileName + '.jpg');
            coverBuffer = song_cover ? Buffer.from(element.data) : null;
            fs.writeFile(cover_artist, coverBuffer, (err) => {
              if(err) {
                console.error("Error writing file", err);
              } else {
              }
            })
          }
          if(element.type !=`front cover` && element.type !=`album cover` && element.type !=`artist`){
            cover = path.join(cover_other_location, fileName + '.jpg');
            coverBuffer = song_cover ? Buffer.from(element.data) : null;
            fs.writeFile(cover, coverBuffer, (err) => {
              if(err) {
                console.error("Error writing file", err);
              } else {
              }
            })
          }
        })
      }
      const duration = metadata.format.duration
      const durationInMinutes = Math.floor(duration / 60);
      const remainingSeconds = Math.round(duration - (durationInMinutes * 60)).toString().padStart(2, '0');
      const duration2 = `${durationInMinutes}:${remainingSeconds}`;
      const albumartist = metadata.common.albumartist;
      const artist = metadata.common.artist;
      const album = metadata.common.album;
      const bit_rate = metadata.format.bitrate;
      const sample_rate = metadata.format.sampleRate;
      const bits_per_sample = metadata.format.bitsPerSample;
      const number_of_channels = metadata.format.numberOfChannels;
      const default_artist_image_src = '../icons/image';
      const modification_time = metadata.format.modificationTime;
      const creation_time = metadata.format.creationTime;
      // const sanitizedFileName = fileName.replace(/[^\w\d]+/g, '_');

      
      const fileObject = {
        song_id: id,
        fileName: fileName,
        covers: {
          song_cover: cover_song,
          album_cover: cover_album,
          artist_cover: cover_artist,
          other_cover: cover
        },
        title: title,
        format: path.parse(file).ext,
        size: undefined,
        bit_rate: bit_rate,
        sample_rate: sample_rate,
        bits_per_sample: bits_per_sample,
        modification_time: modification_time,
        creation_time: creation_time,
        number_of_channels: number_of_channels,
        location: filePath,
        duration: duration,
        duration2: duration2,
        default_artist_image_src: default_artist_image_src,
        albumartist: albumartist,
        artist: artist,
        genre: undefined,
        album: album,
        user_ratings: undefined,
        public_ratings: undefined,
        heart: false,
        number_of_times_played: 0,
        bitrate: undefined,
        composer: undefined,
        track_number : undefined,
        language: undefined,
        release_date: undefined,
        year: undefined,
        lyrics: undefined,
      };
      fileNames.push(fileObject);

      
    }

    // Append new files to the existing list
    const allFiles = existingFiles.concat(fileNames);

    fs.writeFile('./media_files.json', JSON.stringify(allFiles, null, 2), (err) => {
      if (err) {
        console.error("Error writing fileNames.json", err);
      }
    });
 });
});