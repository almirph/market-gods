const request = require("request")
const { cardsArray } = require("./cardsArray")
const FILTER_PERCENT = 0.95
const AWAIT_CALLS = 1000

const urlGods = (sell_token_name) => `https://api.x.immutable.com/v1/orders?buy_token_address=0xccc8cb5229b0ac8069c51fd58367fd1e622afd97&direction=asc&include_fees=true&order_by=buy_quantity&page_size=48&sell_token_address=0xacb3c6a43d15b907e8433077b6d38ae40936fe2c&sell_token_name=${sell_token_name}&sell_token_type=ERC721&status=active`

const filterCard = (card) => request.get(urlGods(card.name), (res, err, body) => {
    try {
        const { result } = JSON.parse(body);
        if (result && result.length > 0) {
            if (result[0]?.buy && result[1]?.buy && parseCardValue(result[0].buy.data) / parseCardValue(result[1].buy.data) < FILTER_PERCENT) {
                console.log(parseCardValue(result[0].buy.data) / parseCardValue(result[1].buy.data))
                console.log(result.length)
                console.log(card)
            }

        }
    }
    catch (erroParse) {
        console.log('erroParse', card.name)
    }

})

const parseCardValue = (buy) => {
    const value = buy.quantity.length <= buy.decimals ? `0.${includeZeros(buy.quantity, buy.decimals - buy.quantity.length)}` : `${buy.quantity.slice(0, buy.quantity.length - buy.decimals)}.${buy.quantity.slice(buy.quantity.length - buy.decimals, buy.quantity.length + 1)}`;
    return parseFloat(value)
}

const includeZeros = (quantity, zeros) => {
    while (zeros > 0) {
        quantity = `0${quantity}`
        zeros--;
    }
    return quantity;
}

const callCardAndWait = (position) => {
    new Promise((resolve) => {
        setTimeout(() => {
            filterCard(cardsArray[position])
            resolve()
        }, AWAIT_CALLS)
    }).then(() => {
        if (position + 1 <= cardsArray.length)
            callCardAndWait(position + 1)
    })



}


const app = () => {
    callCardAndWait(0)
}

app()