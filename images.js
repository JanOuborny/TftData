const fs = require("fs");
const client = require("https");

const setVersion = "set7";

let rawdata = fs.readFileSync(`./${setVersion}/champions.json`);
let champions = JSON.parse(rawdata);

rawdata = fs.readFileSync(`./${setVersion}/traits.json`);
let traits = JSON.parse(rawdata);

if (!fs.existsSync(`./${setVersion}/images`)) {
    fs.mkdirSync(`./${setVersion}/images`);
}
if (!fs.existsSync(`./${setVersion}/images/champions`)) {
    fs.mkdirSync(`./${setVersion}/images/champions`);
}
if (!fs.existsSync(`./${setVersion}/images/traits`)) {
    fs.mkdirSync(`./${setVersion}/images/traits`);
}

champions.forEach(async (c) => {
    console.log("Downloading: " + c.image);
    await downloadImage(
        c.image,
        `./${setVersion}/images/champions/${c.championId}.png`
    );
});

// traits.forEach(async (c) => {
//     console.log("Downloading: " + c.image)
//     await downloadImage(c.image, `./${setVersion}/images/traits/${c.key}.png`);
// });

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
