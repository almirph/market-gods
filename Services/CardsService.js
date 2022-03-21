const request = require("request")
const { cardsArray } = require("../cardsArray")

const AWAIT_CALLS = 10

const urlGods = (buy_token_type, buy_token_address, sell_token_name) => `https://api.x.immutable.com/v1/orders?${buy_token_address ? 'buy_token_address=' + buy_token_address : 'buy_token_type=' + buy_token_type}&direction=asc&include_fees=true&order_by=buy_quantity&page_size=48&sell_token_name=${sell_token_name}&status=active`

class CardsService {

    sellCards = [];

    clean = () => {
        this.sellCards = [];
    }

    filterCard = async (buy_token_type, buy_token_address, percent, card) => {

        return await new Promise((resolve, reject) => {
            request.get(urlGods(buy_token_type, buy_token_address, card.name), (res, err, body) => {
                try {
                    const { result } = JSON.parse(body);
                    if (result && result.length > 48 && result[0].sell.data.properties.collection.name === "Gods Unchained" && result[1].sell.data.properties.collection.name === "Gods Unchained") {
                        if (result[0]?.buy && result[1]?.buy && this.parseCardValue(result[0].buy.data) / this.parseCardValue(result[1].buy.data) < percent) {
                            this.sellCards.push({ firstCard: result[0], secondCard: result[1], cardDescription: card })
                        }
                    }
                    resolve();
                } catch (error) {
                    reject()
                    console.log("Error parse")
                }

            })

        }).then(() => { });

    }

    parseCardValue = (buy) => {
        const value = buy.quantity.length <= buy.decimals ? `0.${this.includeZeros(buy.quantity, buy.decimals - buy.quantity.length)}` : `${buy.quantity.slice(0, buy.quantity.length - buy.decimals)}.${buy.quantity.slice(buy.quantity.length - buy.decimals, buy.quantity.length + 1)}`;
        return parseFloat(value)
    }

    includeZeros = (quantity, zeros) => {
        while (zeros > 0) {
            quantity = `0${quantity}`
            zeros--;
        }
        return quantity;
    }

    callCardAndWait = async (buy_token_type, buy_token_address, percent, set) => {
        return await Promise.allSettled(cardsArray.map(async (card) => {
            if (card && card.name && card.set === set) {
                await new Promise((resolve) => {
                    setTimeout(() => { resolve() }, AWAIT_CALLS);
                })
                    .then(async () =>
                        await this.filterCard(buy_token_type, buy_token_address, percent, card).then((res) => res).catch(error => console.log(error)))

            }
        }))
    }
}



exports.beginCallCards = async (buy_token_type, buy_token_address, percent, set) => {
    const cardsService = new CardsService();
    return await cardsService.callCardAndWait(buy_token_type, buy_token_address, percent, set).then(() => cardsService.sellCards).catch((e) => console.log('error', e));
}
