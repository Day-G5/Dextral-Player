const fs = require('fs');

// Assume the current song is identified by its title (replace with your actual logic)
const currentSongTitle = 'Your Current Song Title';

function updateSongData() {
    // Read the JSON file
    fs.readFile('songs.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            return;
        }

        try {
            const songsData = JSON.parse(data);

            // Find the current song in the data
            const currentSong = songsData.find(song => song.title === currentSongTitle);
            if (currentSong) {
                // Update the relevant information (e.g., number_of_times_played)
                currentSong.number_of_times_played++;

                // Save the updated data back to the file
                fs.writeFile('songs.json', JSON.stringify(songsData, null, 4), 'utf8', err => {
                    if (err) {
                        console.error('Error updating the JSON file:', err);
                    } else {
                        console.log(`Updated the current song '${currentSongTitle}' in songs.json.`);
                    }
                });
            } else {
                console.error(`Song '${currentSongTitle}' not found.`);
            }
        } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
        }
    });
}

updateSongData();
