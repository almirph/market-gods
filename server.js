const express = require('express');
const app = express();

require('./Routes/SalesRoute.js')(app);

app.use(express.json());
app.listen(3333);