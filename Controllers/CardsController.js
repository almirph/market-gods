const url = require('url');
const { beginCallCards, verifySalesCardList } = require('../Services/CardsService');

exports.getByList = async (req, res, next) => {
    const { buy_token_type, buy_token_address, percent, set, quality } = url.parse(req.url, true).query;
    const sellCards = await beginCallCards(buy_token_type, buy_token_address, percent, quality, set).then((sellCards) => sellCards);
    res.status(200).send(sellCards);
};

exports.postVerifyCards = async (req, res, next) => {
    const { buy_token_type, buy_token_address, percent, quality } = url.parse(req.url, true).query;
    const { cardIdList } = req.body;
    const endResult = await verifySalesCardList(buy_token_type, buy_token_address, percent, quality, cardIdList).then((result) => result).catch(error => console.log('error', error));
    res.status(200).send(endResult);
};