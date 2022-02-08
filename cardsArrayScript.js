const fs = require('fs');
const { cards } = require('./cards');

fs.writeFile('cartasArray.json', cards.replace(/"[0-9]*": /g, ''), (err) => {
    if (err) throw err;
    console.log('arquivo foi criado');
});