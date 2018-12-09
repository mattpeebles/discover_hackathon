function getMapKey(){
    console.log('hi')
    return new Promise((res, rej) => {
        $.get('/openMapGl').then(key => {
            console.log(key)
            return res(key);
        })
    })
}

$(document).ready(async () => {
    
    mapboxgl.accessToken = await Promise.resolve(getMapKey());
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
        center: [-74.50, 40], // starting position [lng, lat]
        zoom: 9 // starting zoom
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })
    // $("#basicForm").on("change", e => {
    //    $("#basicForm").submit();
    // })
})