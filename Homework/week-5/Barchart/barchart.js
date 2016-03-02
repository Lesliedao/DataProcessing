/*
/ Leslie Dao
/ 10561234
/
/ Laadt de JSON neerslagsom per maand in Nijverdal in (2014) met D3
/ Bron: http://weerstationnijverdal.nl/metingen/historie/Gemiddelde%20neerslag%20per%20maand.pdf
*/

// Definieer marges en dimensies van de chart
var margin = {top: 50, bottom: 50, left: 60, right: 30};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

// Maak het svg element aan
var svg = d3.select("body").append("svg")
    .attr("class", "chart");

// Maak een g element aan zodat alles daarin de marges volgt
var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// De maanden volgen een ordinal scale, laat d3 de range bepalen
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

// De neerslagsommen volgen een linear scale
var y = d3.scale.linear()
    .range([height, 0]);

// Assen van de barchart
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// Tooltip die verschijnt bij het hoveren over een bar
var tip = d3.tip()
    .attr("class", "tooltip")
    .offset([-10, 0])
    .html(function(d) {return "<strong>" + d.month + ": </strong>" + d.rain + " mm";});

svg.call(tip);

// Inladen van de data uit de JSON file
var data;
d3.json("totalrain2014.json", function(error, json) {
	if (error) return console.warn(error);
	data = json.data;

    // Na het inladen kunnen het domein van x en het domein van y bepaald worden
    x.domain(data.map(function(d) {return d.month;}));
    y.domain([0, d3.max(data, function(d) {return d.rain;})]);

    // Roep de x-as aan onderaan de chart
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Roep de y-as aan en plak er een label aan
    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            // Trial-and-error placement
            .attr("y", 3)
            .attr("dy", ".75em")
            .style("text-anchor", "end")
            .text("Neerslagsom in mm");

    // Maak de bars
    chart.selectAll(".bar")
        // Gebruik de ingeladen data voor de bars
        .data(data)
        .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {return x(d.month);})
            // Zet y en height klaar voor de animatie
            .attr("y", height)
            .attr("height", 0)
            // De x scale houdt de width van elke bar bij
            .attr("width", x.rangeBand())
            // Laat de tooltip zien bij hoveren en verberg bij mouseout
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)
            // Geef de barchart een fancy start animatie
            .transition()
                .duration(function(d, i) {return 100 * i;})
                // Omdat de range van y aflopend is, is y direct te bepalen
                .attr("y", function(d) {return y(d.rain);})
                // maar moet de height bepaald worden met de height van de chart
                .attr("height", function(d) {return height - y(d.rain);});

});
