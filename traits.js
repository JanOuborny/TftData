const puppeteer = require("puppeteer");
const writeJson = require("write-json");

const originsUrl = "https://tftactics.gg/db/origins/";
const classesUrl = "https://tftactics.gg/db/classes/";

async function scrapeTraits() {
    const result = await [
        [originsUrl, "origin"],
        [classesUrl, "class"],
    ].reduce(async (previousPromise, traitCategory) => {
        let traitsArray = await previousPromise;

        let resultTraits = await fetchTraitCategory(traitCategory);
        traitsArray.push(...resultTraits);
        return traitsArray;
    }, Promise.resolve([]));

    return result;
}

async function fetchTraitCategory(traitCategory) {
    const browser = await puppeteer.launch({
        headless: true,
        devtools: false,
    });
    const page = await browser.newPage();
    await page.goto(traitCategory[0], {
        waitUntil: "networkidle2",
    });

    const traits = await page.evaluate((traitCategory) => {
        const traits = [];
        document
            .querySelectorAll(
                `.d-md-block .rt-table .characters-item.trait-table .character-wrapper`
            )
            .forEach((trait) => {
                traits.push({
                    key: trait.textContent.toLowerCase(),
                    image: trait
                        .querySelector(".character-icon")
                        .getAttribute("src"),
                    name: trait.querySelector("div").textContent,
                    type: traitCategory[1],
                });
            });
        return traits;
    }, traitCategory);

    await browser.close();
    return traits;
}

module.exports = { scrapeTraits };
