/*
/ Leslie Dao
/ 10561234
/
/ Laadt de JSON neerslagsom per maand in Nijverdal in (2014) met D3
/ Bron: http://weerstationnijverdal.nl/metingen/historie/Gemiddelde%20neerslag%20per%20maand.pdf
*/

var margin = {top: 50, bottom: 50, left: 60, right: 30};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("class", "chart");

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var tip = d3.tip()
    .attr("class", "tooltip")
    .offset([-10, 0])
    .html(function(d) {return "<strong>" + d.month + ": </strong>" + d.rain;});

svg.call(tip);

var data;
d3.json("totalrain2014.json", function(error, json) {
	if (error) return console.warn(error);
	data = json.data;
    //console.table(data);
    x.domain(data.map(function(d) {return d.month;}));
    y.domain([0, d3.max(data, function(d) {return d.rain;})]);

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 3)
            .attr("dy", ".75em")
            .style("text-anchor", "end")
            .text("Neerslagsom in mm");

    chart.selectAll(".bar")
        .data(data)
        .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {return x(d.month);})
            .attr("y", function(d) {return y(d.rain);})
            .attr("height", function(d) {return height - y(d.rain);})
            .attr("width", x.rangeBand())
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);
});
