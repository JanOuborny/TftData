const puppeteer = require("puppeteer");
const writeJson = require("write-json");

const championsUrl = "https://tftactics.gg/champions";
const originsUrl = "https://tftactics.gg/db/origins/";
const classesUrl = "https://tftactics.gg/db/classes/";

const setVersion = "11";
const setId = "TFT11_"; // Might differ from version if for example setVersion "7_5" and setId "TFT7"

const champions = [];

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        devtools: false,
    });
    const page = await browser.newPage();
    await page.goto(originsUrl, {
        waitUntil: "networkidle2",
    });

    const traits = await page.evaluate(() => {
        const traits = [];
        ["Origin"].forEach((traitCategory) => {
            document
                .querySelectorAll(
                    `.rt-table .characters-item.trait-table .character-wrapper`
                )
                .forEach((trait) => {
                    traits.push({
                        key: trait.textContent.toLowerCase(),
                        image: trait
                            .querySelector(".character-icon")
                            .getAttribute("src"),
                        name: trait.querySelector("div").textContent,
                        type: trait.querySelector("div").textContent.toLowerCase(),
                    });
                });
        });
        return traits;
    });
    writeJson(`./set${setVersion}/traits.json`, traits);
    console.log(traits);
    await browser.close();
})();
