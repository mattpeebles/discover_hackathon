async function addLocationHtml(el, loc, tipInfo){
    var symbol = await getCountry(loc.location.country);
    var priceLevel = loc.price.length;
    var price = "";
    var tipInfoForRestaurant = tipInfo.Restaurant;

    console.log(loc.price.length)

    if(tipInfoForRestaurant.tipPercentage != null){
        loc.minprice = loc.minprice * parseInt(tipInfoForRestaurant.tipPercentage);
        loc.maxprice = loc.maxprice * parseInt(tipInfoForRestaurant.tipPercentage);
    }

    if(tipInfoForRestaurant.flatRate != null){
        loc.minprice = loc.minprice + parseInt(tipInfoForRestaurant.tipPercentage);
        loc.maxprice = loc.maxprice + parseInt(tipInfoForRestaurant.tipPercentage);
    }

    if(tipInfoForRestaurant.isIncluded) //do something
    
    var price = getPriceLevelString(loc.minprice, loc.maxprice, symbol.symbol);

    var html = 
    `<div class="container">
        <div class="row">
            <h5>${loc.name}</h5>
        </div>
        <div class="row">
            ${price}
        </div>
        <div class="row">
            <div class="col-sm">
                ${loc.rating}
            </div>
            <div class="col-sm">
                ${(loc.distance / 1000).toFixed(2)} km
            </div>
        </div>
    </div>`;

    $(`#priceLevel${priceLevel}Results`).append(html);

}

function getPriceLevelString(minPrice, maxPrice, symbol){
    var price = ""

    if(minPrice == 0 && maxPrice == 0){
        price = "";
    }
    else if(maxPrice == 0){
        price += `${symbol}<span class="price" data-price="${minPrice}">${minPrice}+<span>`;
    }
    else if(minPrice == 0){
        price += `<${symbol}<span class="price" data-price="${maxPrice}">${maxPrice}</span>`;
    }
    else{
        price += `${symbol}<span class="price data-price="${maxPrice}">${minPrice}</span> - ${symbol}<span class="price" data-price="${maxPrice}">${maxPrice}</span>`;
    }

    return price
}

function getTipPerc(loc){
    return new Promise((res, rej) => {
        $.get(`/tips/country/${loc}`).then(tip => {
            return res(tip);
        })
    })
}

function parseTipObject(tipJson){
    var result = {};
    
    tipJson.forEach(tip => {
        var isTip = tip.tipClassificationDesc == "Percentage";
        var isFlat = tip.tipClassificationDesc == "Flat Rate";
        var isIncluded = tip.tipClassificationDesc == "Service Charge Included";

        
        result[tip.tipCategoryDesc.replace(/\s/g, '')] = {
            tipPercentage : isTip ? tip.defaultTipAmount : null,
            flatRate: isFlat ? tip.defaulTipAmount : null,
            isIncluded : isIncluded
        };

    })    
    return result;

}

function getMapKey(){
    return new Promise((res, rej) => {
        $.get('/openMapGl').then(key => {
            return res(key);
        })
    })
}

async function getPriceLevels(locations, tipInfo)
{
   var tiers = []
   var symbol = await getCountry(locations[0].location.country);

   var tierInfo = locations.reduce((a, b) => {
        
        if(!a.has(b.price.length)){
            a.add(b.price.length)
            tiers.push({ tier: b.price.length, min: b.minprice, max: b.maxprice})
        }
    
       return a 
    }, new Set())
   
    console.log(tiers)

   tiers.sort((a, b) => a.tier - b.tier).forEach(tier => {
    var priceLevel = tier.tier;
    var priceString = getPriceLevelString(tier.min, tier.max, symbol.symbol)


    var html = `
        <p>
        <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#priceLevel${priceLevel}" aria-expanded="false" aria-controls="collapseExample">
            ${priceString}
        </button>
        </p>
        <div class="collapse" id="priceLevel${priceLevel}">
        <div class="card card-body" id="priceLevel${priceLevel}Results">
        </div>
        </div>`

        $('#actualResults').append(html);
   })
   
    locations.map(loc => addLocationHtml( $("#actualResults"), loc, tipInfo));

}

function getCountry(countryCode){
    return new Promise((res, rej) => {
        $.get(`/curr-conv/${countryCode}`).then(key => {
            return res(key);
        })
    })
}

function getResults(){
    return new Promise((res, rej) => {
        $.get(`/restaurants`).then(results => {
            return res(results);
        })
    })
}

function setUpMap(lat, long){
    new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
        center: [lat, long], // starting position [lng, lat]
        zoom: 9 // starting zoom
    });
}

$(document).ready(async () => {

    mapboxgl.accessToken = await Promise.resolve(getMapKey());
    
    var locations = await getResults();
    var firstResult = locations[0];
    var country = (await getCountry(firstResult.location.country)).countryName;
    
    var tips = parseTipObject(await getTipPerc(country));

    var firstResultLocation = firstResult.coordinates;

    getPriceLevels(locations, tips)

    setUpMap(firstResultLocation.longitude, firstResultLocation.latitude);

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })
    // $("#basicForm").on("change", e => {
    //    $("#basicForm").submit();
    // })
})