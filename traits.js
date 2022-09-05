const puppeteer = require("puppeteer");
const writeJson = require("write-json");

(async () => {
    const traitUrls = {
        class: "https://tftactics.gg/tierlist/classes",
        origin: "https://tftactics.gg/tierlist/origins",
    };

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let traits = [];
    for (let trait in traitUrls) {
        await page.goto(traitUrls[trait], {
            waitUntil: "networkidle2",
        });

        // Set page setting to custom set
        await page.evaluate(() => {
            localStorage.setItem("set", "7.5");
        });
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

        let results = await page.evaluate((traitType) => {
            const results = [];

            const traitEntries = document.querySelectorAll(
                ".main .tier-group .characters-list .characters-item"
            );
            traitEntries.forEach((e) => {
                results.push({
                    key: e
                        .querySelector(".character-wrapper>div")
                        .textContent.toLowerCase(),
                    image: e
                        .querySelector(".character-icon")
                        .getAttribute("src"),
                    name: e.querySelector(".character-wrapper>div").textContent,
                    type: traitType,
                });
            });
            return results;
        }, trait);
        console.log(results);
        traits = traits.concat(results);
    }

    //console.log(traits);
    writeJson("./set7.5/traits.json", traits);
    await browser.close();
})();
