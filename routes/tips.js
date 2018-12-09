var express = require('express');
var router = express.Router();
const axios = require('axios')
var countryLookup = require('country-code-lookup');
const config = require('../config')
const configCountryDciIso = require('../configCountryDciIso')
const clientID = config.clientID
const clientSecret = config.clientSecret
const url = 'https://apis.discover.com/auth/oauth/v2/token'

router.post('/', (req, res) => {
    const countryAbrv = req.body.countryAbrv || 'UK'
    tips(req, res, countryAbrv)
})
router.get('/', (req, res) => {
    const countryAbrv = req.body.countryAbrv || 'UK'
    tips(req, res, countryAbrv)
})

router.get('/country/:countryName*', (req, res) => {
    const requestToken = req.query.code

    axios({
        method: 'post',
        url: `${url}?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials&scope=DCI_TIP`,
        headers: {
            accept: 'application/json'
        }
    }).then((response) => {
        const accessToken = response.data.access_token
        var url = 'https://api.discover.com/dci/tip/v1/guide';
        var queryParams = '?' + encodeURIComponent('countryisonum') + '=' + encodeURIComponent(configCountryDciIso[req.param("countryName")])
        + '&' + encodeURIComponent('langcd') + '=' + encodeURIComponent('en');
        axios({
            method: 'get',
            url: `${url}${queryParams}`,
            headers: {
                'Accept': 'application/json',
                'x-dfs-api-plan': 'DCI_TIPETIQUETTE_SANDBOX',
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then(response => {
            res.send(response.data);
        }).catch(err => { console.log('error', err) })
    }).catch(err => { console.log('error', err) })
})

const tips = (req, res, countryAbrv) => {

    const requestToken = req.query.code

    axios({
        method: 'post',
        url: `${url}?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials&scope=DCI_TIP`,
        headers: {
            accept: 'application/json'
        }
    }).then((response) => {
        const accessToken = response.data.access_token
        var url = 'https://api.discover.com/dci/tip/v1/guide';
        var queryParams = '?' + encodeURIComponent('countryisonum') + '=' + encodeURIComponent(configCountryDciIso[countryLookup.byFips(countryAbrv).country])
        + '&' + encodeURIComponent('langcd') + '=' + encodeURIComponent('en');
        console.log(queryParams)
        axios({
            method: 'get',
            url: `${url}${queryParams}`,
            headers: {
                'Accept': 'application/json',
                'x-dfs-api-plan': 'DCI_TIPETIQUETTE_SANDBOX',
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then(response => {
            res.send(response.data);
        }).catch(err => { console.log('error', err) })
    }).catch(err => { console.log('error', err) })
}
module.exports = router;
