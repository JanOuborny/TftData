const images = require("./images");
const data = require("./data");
const fs = require("fs");

const IMAGE_DIRECTORY_PATH = process.env.IMAGE_DIRECTORY_PATH || "./images/";
const DATA_DIRECTORY_PATH = process.env.IMAGE_DIRECTORY_PATH || "./data/";

(async () => {
    //const setVersion = await data.scrapeLatestSet(DATA_DIRECTORY_PATH);
    const setVersion = "Set10";

    if (setVersion) {
        let rawChampions = fs.readFileSync(
            DATA_DIRECTORY_PATH + setVersion + "/champions.json"
        );
        let rawTraits = fs.readFileSync(
            DATA_DIRECTORY_PATH + setVersion + "/traits.json"
        );

        let champions = JSON.parse(rawChampions);
        let traits = JSON.parse(rawTraits);
        await images.download(IMAGE_DIRECTORY_PATH, champions, traits);
    }
})();
