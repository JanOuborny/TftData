const fs = require('fs');

let rawdata = fs.readFileSync('./set6_5/champions.json');
let champions = JSON.parse(rawdata);