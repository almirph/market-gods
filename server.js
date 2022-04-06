const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express()

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json())

require('./Routes/CardsRoute.js')(app);

app.use(cors());
app.use(express.json());

app.listen(process.env.PORT || 3333);