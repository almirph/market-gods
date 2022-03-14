const SalesController = require('../Controllers/SalesController');

module.exports = (app) => {
   app.get('/sales-list', SalesController.getByList);
}