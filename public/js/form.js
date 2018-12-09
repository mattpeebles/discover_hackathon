async function addLocationHtml(loc, tipInfo){
    var symbol = await getCountry(loc.location.country);
    var priceLevel = loc.price.length;
    var price = "";
    var tipInfoForRestaurant = tipInfo.Restaurant;

    if(tipInfoForRestaurant.tipPercentage != null){
        loc.minprice = loc.minprice * parseInt(tipInfoForRestaurant.tipPercentage);
        loc.maxprice = loc.maxprice * parseInt(tipInfoForRestaurant.tipPercentage);
    }

    if (tipInfoForRestaurant.flatRate != null) {
        loc.minprice = loc.minprice + parseInt(tipInfoForRestaurant.tipPercentage);
        loc.maxprice = loc.maxprice + parseInt(tipInfoForRestaurant.tipPercentage);
    }

    if(tipInfoForRestaurant.isIncluded) //do something
    
    var price = getPriceLevelString(loc.minprice, loc.maxprice, symbol.symbol, 1);

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

function getAtms(lat, long, radius){
    return new Promise((res, rej) => {
        $.get(`/atm?lat=${lat}&long=${long}&radius=${radius}`).then(_ => res(_));
    })
}

function getPriceLevelString(minPrice, maxPrice, symbol, convRate){
    var price = ""
    minPrice = Math.ceil(convRate * minPrice);
    maxPrice = Math.ceil(convRate * maxPrice);

    if (minPrice == 0 && maxPrice == 0) {
        price = "";
    }
    else if (maxPrice == 0) {
        price += `${symbol}<span class="price" data-price="${minPrice}">${minPrice}+<span>`;
    }
    else if (minPrice == 0) {
        price += `<${symbol}<span class="price" data-price="${maxPrice}">${maxPrice}</span>`;
    }
    else {
        price += `${symbol}<span class="price data-price="${maxPrice}">${minPrice}</span> - ${symbol}<span class="price" data-price="${maxPrice}">${maxPrice}</span>`;
    }

    return price
}

function getTipPerc(loc) {
    return new Promise((res, rej) => {
        $.get(`/tips/country/${loc}`).then(tip => {
            return res(tip);
        })
    })
}

function convRate(countryCurrCode){
    return new Promise((res, rej) => {
        $.get(`/curr-conv?currencyto=${countryCurrCode}`).then(result => res(result))
    })
}

function parseTipObject(tipJson){
    var result = {};

    tipJson.forEach(tip => {
        var isTip = tip.tipClassificationDesc == "Percentage";
        var isFlat = tip.tipClassificationDesc == "Flat Rate";
        var isIncluded = tip.tipClassificationDesc == "Service Charge Included";


        result[tip.tipCategoryDesc.replace(/\s/g, '')] = {
            tipPercentage: isTip ? tip.defaultTipAmount : null,
            flatRate: isFlat ? tip.defaulTipAmount : null,
            isIncluded: isIncluded
        };

    })
    return result;

}

function getMapKey() {
    return new Promise((res, rej) => {
        $.get('/openMapGl').then(key => {
            return res(key);
        })
    })
}

async function getPriceLevels(locations, tipInfo)
{
   var tiers = []
   var countryInfo = await getCountry(locations[0].location.country);

   var tierInfo = locations.reduce((a, b) => {
        
    if(!a.has(b.price.length)){
        a.add(b.price.length)
        tiers.push({ tier: b.price.length, min: b.minprice, max: b.maxprice})
    }

   return a 
}, new Set())
   
   var conversionRate = await convRate(countryInfo.currency);
   $('#actualResults').empty();

   tiers.sort((a, b) => a.tier - b.tier).forEach(async tier => {
    var priceLevel = tier.tier;

    var priceString = getPriceLevelString(tier.min, tier.max, "$", conversionRate.exchange_rate)

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
   
    locations.map(loc => addLocationHtml(loc, tipInfo));

}

function getCountry(countryCode) {
    return new Promise((res, rej) => {
        $.get(`/curr-conv/info/${countryCode}`).then(key => {
            return res(key);
        })
    })
}

function getResults(lat, long, radius) {
    return new Promise((res, rej) => {
        $.get(`/restaurants?lat=${lat}&long=${long}&radius=${radius}`).then(results => {
            return res(results);
        })
    })
}

function setUpMap(lat, long) {
    const map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
        center: [lat, long], // starting position [lng, lat]
        zoom: 9 // starting zoom
    });

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    map.on('load', function () {

        // Add a layer showing the places.
        map.addLayer({
            "id": "places",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "properties": {
                            "description": "<strong>ATM</strong><p>ATM</p>",
                            "icon": "star"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [0, 51.5074]
                        }
                    },]
                }
            },
            "layout": {
                "icon-image": "{icon}-15",
                "icon-allow-overlap": true
            }
        });


        map.on('mouseenter', 'places', function (e) {

            map.getCanvas().style.cursor = 'pointer';
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.description;
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            popup.setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });

        map.on('mouseleave', 'places', function () {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

    })

}

async function init(city){
    var locations = await getResults(city.lat, city.long, 7000);
    var firstResult = locations[0];
    
    var country = (await getCountry(firstResult.location.country)).countryName;

    var tips = parseTipObject(await getTipPerc(country));

    var firstResultLocation = firstResult.coordinates;

    getPriceLevels(locations, tips)

    setUpMap(firstResultLocation.longitude, firstResultLocation.latitude);
    var atms = await getAtms(firstResultLocation.longitude, firstResultLocation.latitude, 300);
}

var coordinates = {
    "Paris" : {
        lat: 48.864716,
        long: 2.349014
    },
    "Berlin": {
        lat: 52.520008,
        long: 13.404954
    },
    "London" :{
        lat: 51.509865,
        long: -0.118092
    },
    "New York" : {
        lat: 40.730610,
        long: -73.935242
    }

}

$(document).ready(async () => {

    mapboxgl.accessToken = await Promise.resolve(getMapKey());

    await init(coordinates["London"]);

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    $("#basicForm").on("change", async e => {
        var city = $("#formLocation").find(":selected").text();
        var cityCoord = coordinates[city]
        await init(cityCoord);
    })
})