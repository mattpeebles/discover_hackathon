var express = require('express');
var router = express.Router();
const axios = require('axios')
const config = require('../config')
const clientID = config.clientID
const clientSecret = config.clientSecret
const url = 'https://apis.discover.com/auth/oauth/v2/token'

router.post('/', (req, res) => {
    console.log('ssss', req.body)
    const lat = req.body.lat
    const long = req.body.long
    const radius = req.body.radius || 30
    atm(req, res, lat, long, radius)
})
router.get('/', (req, res) => {
    const lat = req.query.lat
    const long = req.query.long
    const radius = req.query.radius || 30
    atm(req, res, lat, long, radius)
})
const atm = (req, res, lat, long, radius) => {

    const requestToken = req.query.code
    axios({
        method: 'post',
        url: `${url}?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials&scope=DCI_ATM`,
        headers: {
            accept: 'application/json'
        }
    }).then((response) => {
        console.log('x', lat, long, radius)
        const accessToken = response.data.access_token
        var url = 'https://api.discover.com/dci/atm/v1/locations';
        var queryParams = '?' + encodeURIComponent('radius') + '=' + encodeURIComponent(radius) + '&' +
            encodeURIComponent('longitude') + '=' + encodeURIComponent(long) + '&' + encodeURIComponent('latitude') +
            '=' + encodeURIComponent(lat);
        axios({
            method: 'get',
            url: `${url}${queryParams}`,
            headers: {
                'Accept': 'application/json',
                'x-dfs-api-plan': 'DCI_ATM_SANDBOX',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(response => {
            res.send(response.data);
        })
    }).catch(err => { console.log('error', err) })
}
module.exports = router;

/* 
curl -d '{"lat":"43.33","long":"-123.333"}' -H "Content-Type: application/json" -X POST http://localhost:3000/atm

*/