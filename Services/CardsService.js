const request = require("request")
const { cardsArray } = require("../cardsArray")


const AWAIT_CALLS = 10

const urlGods = (buy_token_type, buy_token_address, percent, sell_token_name) => `https://api.x.immutable.com/v1/orders?${buy_token_address ? 'buy_token_address=' + buy_token_address : 'buy_token_type=' + buy_token_type}&direction=asc&include_fees=true&order_by=buy_quantity&page_size=48&sell_token_name=${sell_token_name}&status=active`

class CardsService {

    sellCards = [];

    clean = () => {
        this.sellCards = [];
    }

    filterCard = async (buy_token_type, buy_token_address, percent, card) => {

        return await new Promise((resolve, reject) => {
            request.get(urlGods(buy_token_type, buy_token_address, percent, card.name), (res, err, body) => {
                try {
                    const { result } = JSON.parse(body);
                    if (result && result.length > 0) {
                        if (result[0]?.buy && result[1]?.buy && this.parseCardValue(result[0].buy.data) / this.parseCardValue(result[1].buy.data) < percent) {
                            // console.log(this.parseCardValue(result[0].buy.data) / this.parseCardValue(result[1].buy.data))
                            // console.log(`Cards array size: ${result.length}`)
                            // console.log(card)
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

    // static callCardAndWait = async (buy_token_type, buy_token_address, percent, position) => {
    //     return await Promise.all((resolve) => {
    //         setTimeout(() => {
    //             if (cardsArray[position] && cardsArray[position].name && cardsArray[position].set === "order") {
    //                 const newCard = this.filterCard(buy_token_type, buy_token_address, percent, cardsArray[position])
    //                 if (newCard)
    //                     this.sellCards.push(newCard);
    //             }
    //             resolve()
    //         }, AWAIT_CALLS)
    //     }).then(async () => {
    //         if (position + 1 <= cardsArray.length)
    //             await this.callCardAndWait(buy_token_type, buy_token_address, percent, position + 1)
    //         else{
    //             console.log('here')
    //             return this.sellCards;

    //         }
    //     })

    // }

    callCardAndWait = async (buy_token_type, buy_token_address, percent, position) => {
        return await Promise.allSettled(cardsArray.map(async (card) => {

            //console.log(card.name);
            if (card && card.name && card.set === "order") {
                await this.filterCard(buy_token_type, buy_token_address, percent, card).then((res) => res).catch(error => console.log(error))
            }

        }))
    }
}



exports.beginCallCards = async (buy_token_type, buy_token_address, percent) => {
    const cardsService = new CardsService();
    return await cardsService.callCardAndWait(buy_token_type, buy_token_address, percent, 0).then(() => cardsService.sellCards).catch((e) => console.log('error', e));
}
