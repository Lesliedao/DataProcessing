/*
/ Leslie Dao
/ 10561234
/ D3 Linked Views
/
/ Maakt meerdere gelinkte visualisaties die interactief zijn.
/ Databron: https://en.wikipedia.org/wiki/List_of_countries_by_life_expectancy
*/

var margin = {top: 20, bottom: 40, left: 40, right: 40};
var width = 500 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var barsvg = d3.select("#barchart").append("svg")
    .attr("class", "chart");

var barchart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.ordinal()
    .domain(["Overall", "Female", "Male"])
    .rangeRoundBands([0, width], .1, .5);

var y = d3.scale.linear()
    // .domain([0, 90])
    .range([height, 0]);

// Assen van de barchart
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(8)
    .orient("left");

// Tooltip die verschijnt bij het hoveren over een bar
var tip = d3.tip()
    .attr("class", "tooltip")
    .offset([-10, 0])
    .html(function(d) {return "<strong>Levensverwachting:</strong> " + d.value;});

barsvg.call(tip);

d3.json("lifeexpectancy.json", function(error, json) {
    if (error) throw error;

    // Missende landen toevoegen
    json.GRL = {"name": "Greenland", "Overall": "NA", "Female": "NA", "Male": "NA"};
    json["-99"] = {"name": "Missing codes", "Overall": "NA", "Female": "NA", "Male": "NA"};
    // console.table(json);
    var map = new Datamap({
        // Het HTML element voor de map heeft de id "map"
        element: document.getElementById("map"),
        // De scope is de hele wereld (in eerste instantie)
        scope: 'world',
        // De kleuren die geassocieerd worden met de keys
        fills: {
            LOW: "#edf8e9",
            BELAVG: "#bae4b3",
            AVG: "#74c476",
            ABVAVG: "#31a354",
            HIGH: "#006d2c",
            defaultFill: "#8F8F8F"
        },
        // Focus op Europa
        setProjection: function(element) {
            var projection = d3.geo.conicEqualArea()
                .center([15, 52])
                .rotate([0, 0])
                .scale(750)
                .translate([element.offsetWidth / 2, element.offsetHeight / 2]);

                var path = d3.geo.path()
                    .projection(projection);

            return {path: path, projection: projection};
        },
        data: json,
        geographyConfig: {
            // Geef het gehighlighte land een zwarte border
            highlightBorderColor: 'rgba(0,0,0,0.5)',
            popupTemplate: function(geo, data) {
                return ['<div class="hoverinfo"><strong>',
                        geo.properties.name, ': ' + data.Overall,
                        '</strong></div>'].join('');
            }
        },
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(geo) {
                console.log(geo.id, geo.properties.name);
                if (geo.id == "-99" || geo.id == "GRL") {
                    updateBars({
                        name: geo.properties.name,
                        Overall: 0,
                        Female: 0,
                        Male: 0
                    });
                }
                else {
                    updateBars(json[geo.id]);
                }
            });
        }
    });

    map.legend({
        // Titel van de legenda
        legendTitle: "Legenda",
        // Label voor de default fill (waar geen data voor is)
        defaultFillName: "Geen gegevens",
        // Custom labels voor de fill kleuren (waar wel data voor is)
        labels: {
            LOW: "50 en lager",
            BELAVG: "50 tm 60",
            AVG: "60 tm 70",
            ABVAVG: "70 tm 80",
            HIGH: "80 en hoger"
        }
    });

    barchart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    barchart.append("g")
        .attr("class", "y axis");

});

var oldY = [height, height, height], oldHeight = [0, 0, 0];
function updateBars(object) {
    d3.select("#bartitle").text(object.name);

    var classes = ["Overall", "Female", "Male"];
    var newData = [];

    for (var i = 0; i < classes.length; i++) {
        var datum = {};
        datum.name = object.name;
        datum.type = classes[i];
        datum.nametype = datum.name + datum.type;
        datum.value = object[classes[i]];
        newData.push(datum);
    }

    console.table(newData);

    y.domain([0, d3.max(newData, function(d) {return d.value;})]).nice();

    barchart.select(".y.axis")
        .transition()
            .duration(750)
            .call(yAxis);

    // Dirty oplossing
    var bars = barchart.selectAll(".bar")
        .data(newData, function(d) {return d.nametype;});

    bars.enter().append("rect")
        .attr("class", function(d) {return "bar " + d.type;})
        .attr("x", function(d) {return x(d.type);})
        .attr("y", function(d, i) {return oldY[i];})
        .attr("height", function(d, i) {return oldHeight[i];})
        .attr("width", x.rangeBand())
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .transition()
            .duration(750)
            .attr("y", function(d, i) {
                oldY[i] = y(d.value);
                return y(d.value);
            })
            .attr("height", function(d, i) {
                oldHeight[i] = height - y(d.value);
                return height - y(d.value);
            });

    bars.exit().remove();

}
