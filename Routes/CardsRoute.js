const CardsController = require('../Controllers/CardsController');
const cors = require('cors');

module.exports = (app) => {
   app.get('/health', cors(), CardsController.health);

   app.get('/sales-list', cors(), CardsController.getByList);

   app.post('/verify-cards', cors(), CardsController.postVerifyCards);
}
