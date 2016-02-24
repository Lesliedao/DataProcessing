/*
/ Leslie Dao
/ 10561234
/
/ Laadt de JSON gemiddelde neerslag per maand in Nijverdal in (2014) met D3
/ Bron: http://weerstationnijverdal.nl/metingen/historie/Gemiddelde%20neerslag%20per%20maand.pdf
*/

var data;
d3.json("avgrain2014.json", function(error, json) {
	if (error) return console.warn(error);
	data = json;
	console.log(data);
});