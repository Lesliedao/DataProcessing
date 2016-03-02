/*
/ Leslie Dao
/ 10561234
/
/ Laadt de JSON neerslagsom per maand in Nijverdal in (2014) met D3
/ Bron: http://weerstationnijverdal.nl/metingen/historie/Gemiddelde%20neerslag%20per%20maand.pdf
/ De barchart met functionaliteit staat in de map week-5/Barchart
*/

var data;
d3.json("totalrain2014.json", function(error, json) {
	if (error) return console.warn(error);
	data = json.data;
    console.log(data);
});
