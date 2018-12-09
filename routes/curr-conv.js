var express = require('express');
var router = express.Router();
const axios = require('axios')
const config = require('../config')
const clientID = config.clientID
const clientSecret = config.clientSecret
const url = 'https://apis.discover.com/auth/oauth/v2/token'

router.post('/', (req, res) => {
    const currencyTo = req.body.currencyto
    currConv(req, res, currencyTo)
})
router.get('/', (req, res) => {
    const currencyTo = req.query.currencyto
    currConv(req, res, currencyTo)
})
const currConv = (req, res, currencyTo) => {
    console.log('currencyTo: ', currencyTo)
    axios({
        method: 'post',
        url: `${url}?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials&scope=DCI_CURRENCYCONVERSION`,
        headers: {
            accept: 'application/json'
        }
    }).then((response) => {
        const accessToken = response.data.access_token
        var url = 'https://api.discover.com/dci/currencyconversion/v1/exchangerate';
        var queryParams = '?' + encodeURIComponent('currencycd') + '=' + encodeURIComponent(currencyTo)
            + '&' + encodeURIComponent('langcd') + '=' + encodeURIComponent('en');

        axios({
            method: 'get',
            url: `${url}${queryParams}`,
            headers: {
                'Accept': 'application/json',
                'x-dfs-api-plan': 'DCI_CURRENCYCONVERSION_SANDBOX',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(response => {
            res.send(response.data);
        }).catch(err => { console.log('error A', err) })
    }).catch(err => { console.log('error B', err) })
}
module.exports = router;

/* 
currency from: USA
currency to: Varius
curl -d '{"lat":"43.33","long":"-123.333"}' -H "Content-Type: application/json" -X POST http://localhost:3000/atm

*/