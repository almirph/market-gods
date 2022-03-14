const url = require('url');
const { beginCallCards } = require('../Services/CardsService');

exports.getByList = async (req, res, next) => {
    const {buy_token_type, buy_token_address, percent} = url.parse(req.url, true).query;
    const sellCards = await beginCallCards(buy_token_type, buy_token_address, percent).then((sellCards) => sellCards);
    res.status(200).send(sellCards);
 };