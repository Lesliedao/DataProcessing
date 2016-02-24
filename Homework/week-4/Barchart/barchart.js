/*
/ Leslie Dao
/ 10561234
/
/ Laadt de JSON gemiddelde maandtemperatuur in de Bilt in (2014) met D3
/ Bron: https://cdn.knmi.nl/knmi/map/page/klimatologie/gegevens/maandgegevens/mndgeg_260_tg.txt
*/

var data;
d3.json("avgtemp2014.json", function(error, json) {
	if (error) return console.warn(error);
	data = json;
	console.log(data);
});