const puppeteer = require("puppeteer");
const writeJson = require("write-json");
const fs = require("fs");
const traitsScrape = require("./traits");

const CHAMPIONS_URL = "https://tftactics.gg/champions";

async function scrapeLatestSet(dataDirectoryPath) {
    const DATA_DIRECTORY_PATH = dataDirectoryPath;
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
    });
    const page = await browser.newPage();
    await page.goto(CHAMPIONS_URL, {
        waitUntil: "networkidle2",
    });

    let currentVersion = await page.evaluate(() => {
        const setBtn = document.querySelector(
            "#root > div > nav.nav.toolbar > div.nav-wrapper.container > div.set-btn.dropdown > button"
        );
        return setBtn.textContent.replace(/\s/g, "");
    });
    console.log("Set version: " + currentVersion);

    if (currentVersion == null) {
        console.log("Failed to get set version.");
        await browser.close();
        return null;
    }
    const SET_VERSION_NUMBER = currentVersion.match(/\d+/);
    const SET_PATH = DATA_DIRECTORY_PATH + currentVersion;
    try {
        if (!fs.existsSync(SET_PATH)) {
            fs.mkdirSync(SET_PATH);
        } else {
            console.log("Set already exists. Nothing to update.");
            await browser.close();
            return currentVersion;
        }
    } catch (err) {
        console.error(err);
        return null;
    }

    const champions = await page.evaluate((setVersionNumber) => {
        const results = [];

        // Gather basic champion data
        const entries = document.querySelectorAll(
            ".main .characters-list .characters-item"
        );
        entries.forEach((e) => {
            let champion = {
                championId:
                    `TFT${setVersionNumber}_` +
                    e
                        .querySelector(".character-name")
                        .textContent.replace(/[^\w]/g, ""),
                link: e.getAttribute("href"),
                image: e.querySelector(".character-icon").getAttribute("src"),
                name: e.querySelector(".character-name").textContent,
            };
            results.push(champion);
        });
        return results;
    }, SET_VERSION_NUMBER);

    const traits = await traitsScrape.scrapeTraits();

    // Gather for each champion its cost and traits
    for (let j = 0; j < champions.length; j++) {
        const c = champions[j];
        await page.goto("https://tftactics.gg" + c.link);
        c.traits = await page.evaluate(() => {
            const traits = [];
            const abilites = document.querySelectorAll(
                ".main .character-ability"
            );
            for (let i = 1; i < abilites.length; i++) {
                traits.push(
                    abilites[i]
                        .querySelector(".ability-description-name h2")
                        .textContent.toLowerCase()
                );
            }
            return traits;
        });
        c.cost = await page.evaluate(() => {
            return parseInt(
                document
                    .querySelector(".character-stats li")
                    .textContent.match(/\d/)[0]
            );
        });
    }

    //console.log(champions);
    writeJson(SET_PATH + "/traits.json", traits);
    writeJson(SET_PATH + "/champions.json", champions);
    await browser.close();
}

module.exports = { scrapeLatestSet };
