const SalesController = require('../Controllers/SalesController');
const cors = require('cors');

module.exports = (app) => {
   app.get('/sales-list', cors(), SalesController.getByList);
}