const puppeteer = require("puppeteer");
const writeJson = require("write-json");

const championsUrl = "https://tftactics.gg/champions";
const originsUrl = "https://tftactics.gg/tierlist/origins";
const classesUrl = "https://tftactics.gg/tierlist/classes";

const setVersion = "7.5";
const setId = "TFT7_"; // Might differ from version if for example setVersion "7_5" and setId "TFT7"

const champions = [];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(championsUrl, {
        waitUntil: "networkidle2",
    });

    // Set page setting to custom set
    await page.evaluate(() => {
        localStorage.setItem("set", "7.5");
    });
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

    let results = await page.evaluate(() => {
        const results = [];

        const entries = document.querySelectorAll(
            ".main .characters-list .characters-item"
        );
        entries.forEach((e) => {
            let champion = {
                championId:
                    "TFT7_" +
                    e
                        .querySelector(".character-name")
                        .textContent.replace(/\s+/g, ""),
                link: e.getAttribute("href"),
                image: e.querySelector(".character-icon").getAttribute("src"),
                name: e.querySelector(".character-name").textContent,
            };
            results.push(champion);
        });
        return results;
    });

    for (let j = 0; j < results.length; j++) {
        const c = results[j];
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

    console.log(results);
    writeJson("./set" + setVersion + "/champions.json", results);
    await browser.close();
})();
