var express = require('express');
var router = express.Router();
const axios = require('axios')
const config = require('../config')
const clientID = config.clientID
const clientSecret = config.clientSecret
const url = 'https://apis.discover.com/auth/oauth/v2/token'

router.get('/', (req, res) => {
    const requestToken = req.query.code
    axios({
        method: 'post',
        url: `${url}?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials&scope=DCI_ATM`,
        headers: {
            accept: 'application/json'
        }
    }).then((response) => {
        const accessToken = response.data.access_token
        var url = 'https://api.discover.com/dci/atm/v1/locations';
        var queryParams = '?' + encodeURIComponent('radius') + '=' + encodeURIComponent('121') + '&' + encodeURIComponent('longitude') + '=' + encodeURIComponent('-122.419') + '&' + encodeURIComponent('latitude') + '=' + encodeURIComponent('43.111');
        axios({
            method: 'get',
            url: `${url}${queryParams}`,
            headers: {
                'Accept': 'application/json',
                'x-dfs-api-plan': 'DCI_ATM_SANDBOX',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(response => {
            console.log('success', response.data)
            res.send(response.data);
            // response.render('index', { title: 'XXX' });
        })
    }).catch(err => { console.log('error', err) })
})

module.exports = router;
