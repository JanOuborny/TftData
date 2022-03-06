const puppeteer = require('puppeteer');
const writeJson = require('write-json'); 

const championsUrl = 'https://tftactics.gg/champions';
const originsUrl = 'https://tftactics.gg/tierlist/origins';
const classesUrl = 'https://tftactics.gg/tierlist/classes';

const champions = [];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(championsUrl, {
      waitUntil: 'networkidle2',
    });

    let results = await page.evaluate(() => {
        const results = [];

        const entries = document.querySelectorAll('.main .characters-list .characters-item');
        entries.forEach(e => {
            let champion = {
                link: e.getAttribute("href"),
                image: e.querySelector(".character-icon").getAttribute("src"),
                name: e.querySelector('.character-name').textContent,
                key: e.querySelector('.character-name').textContent.replace(/\s+/g, '')
            }
            results.push(champion);
        })
        return results;
    });

    for(let j = 0; j < results.length; j++) {
        const c = results[j];
        await page.goto('https://tftactics.gg' + c.link);
        c.traits = await page.evaluate(() => {
            const traits = [];
            const abilites = document.querySelectorAll('.main .character-ability');
            for(let i = 1; i < abilites.length; i++) {
                traits.push(abilites[i].querySelector(".ability-description-name h2").textContent);
            }
            return traits;
        });
    };
    

    console.log(results);
    writeJson('./set6_5/champions.json', results);
    await browser.close();
})();

function getCost() {
    return 0;
}