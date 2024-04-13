const fs = require("fs");
const client = require("https");

async function download(imagesDirectoryPath, champions, traits) {
    if (!fs.existsSync(imagesDirectoryPath)) {
        fs.mkdirSync(imagesDirectoryPath);
    }
    if (!fs.existsSync(imagesDirectoryPath + "champions")) {
        fs.mkdirSync(imagesDirectoryPath + "champions");
    }
    if (!fs.existsSync(imagesDirectoryPath + "traits")) {
        fs.mkdirSync(imagesDirectoryPath + "traits");
    }

    champions.forEach(async (c) => {
        console.log("Downloading: " + c.image);
        await downloadImage(
            c.image,
            imagesDirectoryPath + `champions/${c.championId}.png`
        );
    });

    traits.forEach(async (c) => {
        console.log("Downloading: " + c.image);
        await downloadImage(
            c.image,
            imagesDirectoryPath + `traits/${c.key}.png`
        );
    });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on("error", reject)
                    .once("close", () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(
                    new Error(
                        `Request Failed With a Status Code: ${res.statusCode}`
                    )
                );
            }
        });
    });
}

module.exports = { download };
