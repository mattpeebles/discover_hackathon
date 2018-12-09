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
        loc.minprice = loc.minrice + parseInt(tipInfoForRestaurant.tipPercentage);
        loc.maxprice = loc.maxprice + parseInt(tipInfoForRestaurant.tipPercentage);
    }

    if(tipInfoForRestaurant.isIncluded) //do something

    if(loc.minPrice == 0 && loc.maxprice == 0){
        price = "";
    }
    else if(loc.maxprice == 0){
        price += `${symbol.symbol}<span class="price" data-price="${loc.minprice}">${loc.minprice}+<span>`;
    }
    else if(loc.minprice == 0){
        price += `<${symbol.symbol}<span class="price" data-price="${loc.maxprice}">${loc.maxprice}</span>`;
    }
    else{
        price += `${symbol.symbol}<span class="price data-price="${loc.minprice}">${loc.minprice}</span> - ${symbol.symbol}<span class="price" data-price="${loc.maxprice}">${loc.maxprice}</span>`;
    }
    
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

function getPriceLevels(locations, tipInfo)
{
   var tiers = []
   locations.reduce((a, b) => a.add(b.price.length), new Set()).forEach(level => tiers.push(level) )
   
   console.log(tiers.sort());
    
   tiers.forEach(priceLevel => {
    var html = `
        <p>
            <a class="btn btn-primary" data-toggle="collapse" href="#${priceLevel}" role="button" aria-expanded="false" aria-controls="${priceLevel}">
                Link with href
            </a>
            <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#${priceLevel}" aria-expanded="false" aria-controls="${priceLevel}">
                Button with data-target
            </button>
        </p>
        <div class="collapse" id="priceLevel0">
        <div class="card card-body" id="priceLevel${priceLevel}Results">
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.
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