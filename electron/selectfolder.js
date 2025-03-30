const fs = require('fs');
const { app, dialog } = require('electron');
const filePath = './song_folders.json';
const { exec } = require('child_process');

// Function to check if a file exists
function fileExists(filePath) {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });
}

// Function to read a JSON file
function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

// Function to write a JSON file
function writeJsonFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null,   2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Function to select a folder using Electron's dialog
// function selectFolder() {
  
//   app.whenReady().then( () => { return new Promise((resolve, reject) => {
//     dialog.showOpenDialog({
//       properties: ['openDirectory']
//     }).then(result => {
//       if (!result.canceled) {
//         resolve(result.filePaths[0]);
//       } else {
//         reject(new Error('No folder selected'));
//       }
//     }).catch(reject);
//   }); })
  // dialog.showOpenDialog(null, {properties: ['openDirectory']})
  // .then(result => {
  //   if (!result.canceled) {
  //     const selectedPath = result.filePaths[0];
  //     // Handle the selected folder path
  //     console.log(`Selected folder: ${selectedPath}`);
  //   } else {
  //     console.log('No folder selected.');
  //   }
  // })
  // .catch(error => {
  //   console.error('Error opening dialog:', error);
  // });
// }

function selectFolder() {
  return new Promise((resolve, reject) => {
    app.whenReady().then(() => {
      dialog.showOpenDialog({
        properties: ['openDirectory']
      }).then(result => {
        if (!result.canceled) {
          resolve(result.filePaths[0]);
        } else {
          reject(new Error('No folder selected'));
        }
      }).catch(reject);
    });
  });
}


// Main function to handle the file and folder selection
async function handleFileAndFolder() {
  try {
    const exists = await fileExists(filePath);
    let data = exists ? await readJsonFile(filePath) : {};

    // Use Electron to select a folder
    const folderPath = await selectFolder();

    // Check if the folder path already exists in the data object
    const folderKey = Object.keys(data).find(key => data[key] === folderPath);
    if (folderKey) {
      console.log(`Folder path already exists with key: ${folderKey}`);
      // Quit the Electron app
      app.quit();
      return; // Exit the function early
    }

    // Generate a unique key for the folder
    const uniqueKey = `folder_${Date.now()}`;

    // Add the selected folder to the object with the unique key
    data[uniqueKey] = folderPath;

    // Store the object back to the JSON file
    await writeJsonFile(filePath, data);

    console.log('File updated successfully');
  } catch (error) {
    console.error('An error occurred:', error);
    // Quit the Electron app in case of an error
    app.quit();
  } finally {
    console.log('here 1')
    exec('node node-getsongs.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`An error occurred: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error output: ${stderr}`);
        return;
      }
      console.log(`Standard output: ${stdout}`);

      app.quit();
    });
  }
}

handleFileAndFolder();