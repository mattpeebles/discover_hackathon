var express = require('express');
var router = express.Router();
const config = require('../config')
const yelp = require('yelp-fusion');
const client = yelp.client(config.yelpkey);

const priceRange = require('../configPrices')

function getPrices(country,pricestring) {
    return priceRange[country][pricestring];
}

router.get('/', (req, res) => {

    const lat = req.body.lat || 51.528308
    const long = req.body.long || -0.171663
    const radius = req.body.radius || 7000
    const type = req.body.type || 'lunch'
    restaurants(req, res, lat, long, radius, type)
})
const restaurants = (req, res, lat, long, radius, type) => {
    client.search({
        latitude: lat,
        longitude: long,
        radius: radius,
        term: type,
    }).then(response => {

        var restaurantsList = response.jsonBody.businesses.map(function (business) {
            
            var prices= getPrices(business.location.country,business.price)
            business.minprice = prices.min
            business.maxprice = prices.max

            return business
        })

        res.send(restaurantsList);
    }).catch(e => {
        console.log(e);
        res.send(e);
    });
};

module.exports = router;