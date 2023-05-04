function seaching_nearest_node(lat,lon){

    const apiUrl = "https://www.overpass-api.de/api/interpreter?";

    const proximity = 5;
    const latitude = lat;
    const longitude = lon;

    (async () => {
        const query = `[out:json][timeout:25];way[highway](around:${proximity},${latitude},${longitude});out body;>;out skel qt;`;
        const api = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json", 
            },
            body: query,
        });

        const answer = await api.json();
        console.log(answer);
    })();

}

module.exports = {seaching_nearest_node};