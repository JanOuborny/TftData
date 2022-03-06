const fs = require('fs');
const client = require('https');

let rawdata = fs.readFileSync('./set6_5/champions.json');
let champions = JSON.parse(rawdata);

rawdata = fs.readFileSync('./set6_5/traits.json');
let traits = JSON.parse(rawdata);

champions.forEach(async (c) => {
    console.log("Downloading: " + c.image)
    await downloadImage(c.image, "./set6_5/images/champions/" + c.key + ".png");
});

traits.forEach(async (c) => {
    console.log("Downloading: " + c.image)
    await downloadImage(c.image, "./set6_5/images/traits/" + c.key + ".png");
});


function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
}