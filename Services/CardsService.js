const request = require("request")
const { cardsArray } = require("../cardsArray")

const AWAIT_CALLS = () => 1000 * Math.floor(Math.random() * 5);

const cardsArraySize = 200;

const urlGods = (buy_token_type, buy_token_address, quality, sell_token_name, id) => 'https://api.x.immutable.com/v1/orders?'
    .concat(`direction=asc&include_fees=true&order_by=buy_quantity&page_size=${cardsArraySize}&status=active`)
    .concat(buy_token_address ? '&buy_token_address='.concat(buy_token_address) : '&buy_token_type='.concat(buy_token_type))
    .concat(sell_token_name ? '&sell_token_name='.concat(sell_token_name) : '')
    .concat(quality && !sell_token_name ? `&sell_metadata=%7B%22proto%22%3A%5B%22${id}%22%5D%2C%22quality%22%3A%5B%22${quality}%22%5D%7D` : '')

class CardsService {

    sellCards = [];

    hadError = false;

    clean = () => {
        this.sellCards = [];
    }

    filterCard = async (buy_token_type, buy_token_address, percent, quality, cardName, id) => {

        return await new Promise((resolve, reject) => {
            request.get(urlGods(buy_token_type, buy_token_address, quality, cardName, id), (res, err, body) => {
                try {
                    const { result } = JSON.parse(body);
                    if (result && result.length >= cardsArraySize) {
                        if (this.verifyHighCardFee(result[0]) || this.verifyHighCardFee(result[1])) {
                            result.sort((cardA, cardB) => this.addCardFee(cardA) - this.addCardFee(cardB));
                        }
                        if (result[0].sell.data.properties.collection.name === "Gods Unchained" && result[1].sell.data.properties.collection.name === "Gods Unchained" && result[2].sell.data.properties.collection.name === "Gods Unchained") {
                            this.verifyAndSetCards(result, percent);
                        }
                    }
                    resolve();
                } catch (error) {
                    reject()
                    this.hadError = true;
                    console.log("Error parse", error)
                }

            })

        }).then(() => { });

    }

    verifyAndSetCards = (result, percent) => {
        if (result[0]?.buy && result[1]?.buy && this.parseCardValue(result[0].buy.data) / this.parseCardValue(result[1].buy.data) < percent)
            this.sellCards.push({ firstCard: result[0], secondCard: result[1] })
        //else if (result[1]?.buy && result[2]?.buy && this.parseCardValue(result[1].buy.data) / this.parseCardValue(result[2].buy.data) < percent)
        //    this.sellCards.push({ firstCard: result[0], secondCard: result[1], thirdCard: result[2] })
    }

    verifyHighCardFee = (card) => {
        const fees = card.fees;
        if (!card || !card.fees || card.fees.length <= 0)
            return false;

        let sumFees = fees.reduce((prevFee, currFee) =>
            prevFee + this.parseCardValue({ quantity: currFee.amount, decimals: currFee.token.data.decimals }), 0
        );

        if (sumFees / this.parseCardValue(card.buy.data) > 0.05) {
            return true;
        }

        return false;
    }

    addCardFee = (card) => {
        if (!card || !card.fees || card.fees.length <= 0)
            return this.parseCardValue(card.buy.data)

        let sumFees = card.fees.reduce((prevFee, currFee) =>
            prevFee + this.parseCardValue({ quantity: currFee.amount, decimals: currFee.token.data.decimals }), 0
        );

        return this.parseCardValue(card.buy.data) + sumFees;
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

    callCardAndWait = async (buy_token_type, buy_token_address, percent, quality, set) => {
        return await Promise.allSettled(cardsArray.map(async (card) => {
            if (card && card.name && card.set === set) {
                await new Promise((resolve) => {
                    setTimeout(() => { resolve() }, AWAIT_CALLS());
                })
                    .then(async () =>
                        await this.filterCard(buy_token_type, buy_token_address, percent, quality, card.name).then((res) => res).catch(error => console.log(error)))

            }
        }))
    }

    callCardByIds = async (buy_token_type, buy_token_address, percent, quality, cardIdList) => {
        return await Promise.allSettled(cardIdList.map(async (id) => {
            await new Promise((resolve) => {
                setTimeout(() => { resolve() }, AWAIT_CALLS);
            })
                .then(async () =>
                    await this.filterCard(buy_token_type, buy_token_address, percent, quality, null, id).then((res) => res).catch(error => console.log(error)))
        }))
    }
}



exports.beginCallCards = async (buy_token_type, buy_token_address, percent, quality, set) => {
    const cardsService = new CardsService();
    return await cardsService.callCardAndWait(buy_token_type, buy_token_address, quality, percent, set).then(() => cardsService.sellCards).catch((e) => console.log('error', e));
}

exports.verifySalesCardList = async (buy_token_type, buy_token_address, percent, quality, cardIdList) => {
    const cardsService = new CardsService();
    return await cardsService.callCardByIds(buy_token_type, buy_token_address, percent, quality, cardIdList).then(() => { return { result: { sellCards: cardsService.sellCards, hadError: cardsService.hadError } } }).catch((e) => console.log('error', e));
}
