/*
/ Leslie Dao
/ 10561234
/ D3 Linked Views
/
/ Maakt meerdere gelinkte visualisaties die interactief zijn.
/ Databron: https://en.wikipedia.org/wiki/List_of_countries_by_life_expectancy
*/

// Afmetingen van de barchart
var margin = {top: 20, bottom: 40, left: 40, right: 40};
var width = 500 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

// Zet de svg klaar
var barsvg = d3.select("#barchart").append("svg")
    .attr("class", "chart");

var barchart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Schalen voor de bars
var x = d3.scale.ordinal()
    .domain(["Overall", "Female", "Male"])
    .rangeRoundBands([0, width], .1, .5);

var y = d3.scale.linear()
    .domain([0, 90])
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
    .html(function(d) {return "<strong>Life expectancy:</strong> " + d.value;});

barsvg.call(tip);

// Laad eerst de csv in zodat deze aangeroepen kan worden bij een klik op de kaart
d3.csv("betterlifeindex.csv", function(error, rows) {
    if (error) throw error;

    // Laad de json in
    d3.json("lifeexpectancy.json", function(errorjson, json) {
        if (errorjson) throw errorjson;

        // Missende landen toevoegen
        json.GRL = {"name": "Greenland", "Overall": "NA", "Female": "NA", "Male": "NA"};
        json.GUF = {"name": "French Guiana", "Overall": "NA", "Female": "NA", "Male": "NA"};
        json.PSE = {"name": "West Bank", "Overall": "NA", "Female": "NA", "Male": "NA"};
        json.CIV = {"name": "Ivory Coast", "Overall": "NA", "Female": "NA", "Male": "NA"};
        json.COG = {"name": "Republic of the Congo", "Overall": "NA", "Female": "NA", "Male": "NA"};
        json.TZA = {"name": "Tanzania", "Overall": "NA", "Female": "NA", "Male": "NA"};
        json.LAO = {"name": "Laos", "Overall": "NA", "Female": "NA", "Male": "NA"};
        json.PRK = {"name": "North Korea", "Overall": "NA", "Female": "NA", "Male": "NA"};
        json.ATF = {"name": "French Southern and Antarctic Lands", "Overall": "NA", "Female": "NA", "Male": "NA"};
        json["-99"] = {"name": "Missing codes", "Overall": "NA", "Female": "NA", "Male": "NA"};

        // Maak de datamap aan
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
            // Schaal de kaart
            setProjection: function(element) {
                var projection = d3.geo.equirectangular()
                    .center([40, 12])
                    .rotate([0, 0])
                    .scale(175)
                    .translate([element.offsetWidth / 2, element.offsetHeight / 2]);

                    var path = d3.geo.path()
                        .projection(projection);

                return {path: path, projection: projection};
            },
            // De data is de ingeladen json
            data: json,
            geographyConfig: {
                // Geef het gehighlighte land een zwarte border
                highlightBorderColor: 'rgba(0,0,0,0.5)',
                // Popup bij hoveren over een land
                popupTemplate: function(geo, data) {
                    return ['<div class="hoverinfo"><strong>',
                            geo.properties.name, ': ' + data.Overall,
                            '</strong></div>'].join('');
                }
            },
            // Event binden aan het klikken op een land
            done: function(datamap) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geo) {
                    // Als een land zonder data wordt aangeklikt:
                    if (geo.id == "-99" || geo.id == "GRL" || geo.id == "GUF" || geo.id == "PSE" || geo.id == "CIV" ||
                        geo.id == "COG" || geo.id == "TZA" || geo.id == "LAO" || geo.id == "PRK" || geo.id == "ATF") {
                        // Zet de y-as uit
                        d3.select(".y.axis").transition()
                            .duration(750)
                            .style("opacity", 0);

                        // Maak een custom object met waarden 0
                        updateBars({
                            name: geo.properties.name,
                            Overall: 0,
                            Female: 0,
                            Male: 0
                        });
                    }
                    else {
                        // Zet de y-as weer aan als deze uit was gezet
                        d3.select(".y.axis").transition()
                            .duration(750)
                            .style("opacity", 1);

                        // Update de barchart met de data van het land uit de json
                        updateBars(json[geo.id]);
                    }

                    // Pak data van het land uit de csv
                    var tableinfo = rows.filter(function(d) {return d.LOCATION === geo.id;});
                    // Als het land in de csv voorkomt, geef de array mee
                    if (tableinfo.length !== 0) {
                        updateTable(tableinfo);
                    }
                    // Anders geef een custom array mee met waarden "NA"
                    else {
                        var tableNA = ["NA", "NA", "NA", "NA", "NA", "NA", "NA"].map(function(d) {return {Country: geo.properties.name, Value: d};});
                        updateTable(tableNA);
                    }
                });
            }
        });

        // Maak een legenda
        map.legend({
            // Titel van de legenda
            legendTitle: "Legend",
            // Label voor de default fill (waar geen data voor is)
            defaultFillName: "No data",
            // Custom labels voor de fill kleuren (waar wel data voor is)
            labels: {
                LOW: "50 and below",
                BELAVG: "50 to 60",
                AVG: "60 to 70",
                ABVAVG: "70 to 80",
                HIGH: "80 and above"
            }
        });

        // Roep de initiele x-as aan
        barchart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Zet de y-as klaar
        barchart.append("g")
            .attr("class", "y axis")
            .style("opacity", 0)
            .call(yAxis);
    });
});

// var countries = Datamap.prototype.worldTopo.objects.world.geometries;
// for (var i = 0; i < countries.length; i++) {
//     console.log(countries[i].id, countries[i].properties.name);
// }

// Containers voor de oude waarden van y en height voor transitions
var oldY = [height, height, height], oldHeight = [0, 0, 0];

// Functie om de barchart te updaten
function updateBars(object) {
    // Update de header voor de barchart en tabel
    d3.select("#charttitle").text(object.name);

    // Dit zijn de kolommen met data in de csv
    var classes = ["Overall", "Female", "Male"];

    // Array die objecten met data gaat bevatten
    var newData = [];

    for (var i = 0; i < classes.length; i++) {
        // Elke categorie krijgt een eigen object
        var datum = {};

        // Naam van het land
        datum.name = object.name;
        // Type levensverwachting: Overall, Female of Male
        datum.type = classes[i];
        // Maak een "nametype" key aan om als key functie te dienen
        datum.nametype = datum.name + datum.type;
        // De waarde van de levensverwachting
        datum.value = object[classes[i]];

        // Append het object aan de data array
        newData.push(datum);
    }

    // Gebruik de "nametype" key in de key function (staat voor nieuwe data, of enter)
    var bars = barchart.selectAll(".bar")
        .data(newData, function(d) {return d.nametype;});

    // Enter en maak bars aan voor nieuwe data
    bars.enter().append("rect")
        .attr("class", function(d) {return "bar " + d.type;})
        .attr("x", function(d) {return x(d.type);})
        // Gebruik de "old" waarden om de bars een transition te geven
        .attr("y", function(d, i) {return oldY[i];})
        .attr("height", function(d, i) {return oldHeight[i];})
        .attr("width", x.rangeBand())
        // Tooltip op de bars
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .transition()
            .duration(750)
            // Sla de huidige waarden van y en height op voor gebruik in transitions
            .attr("y", function(d, i) {
                oldY[i] = y(d.value);
                return y(d.value);
            })
            .attr("height", function(d, i) {
                oldHeight[i] = height - y(d.value);
                return height - y(d.value);
            });

    // Verwijder de oude data
    bars.exit().remove();
}

function updateTable(data) {
    // Update de tabel volgens de id's die dezelfde indices volgen als de input data array
    for (var i = 0; i < data.length; i++) {
        d3.select("#tablevalue" + i).text(data[i].Value);
    }
}
