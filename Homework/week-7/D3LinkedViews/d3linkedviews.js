/*
/ Leslie Dao
/ 10561234
/ D3 Linked Views
/
/ Maakt meerdere gelinkte visualisaties die interactief zijn.
/ Klikken op de datamap updatet de barchart en tabel met nieuwe data (indien beschikbaar).
/
/ Databron 1: http://apps.who.int/gho/data/node.main.688?lang=en
/ Databron 2: http://stats.oecd.org/Index.aspx?DataSetCode=BLI#
/ Colorbrewer: https://github.com/mbostock/d3/tree/master/lib/colorbrewer
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
    .ticks(20)
    .orient("left");

// Tooltip die verschijnt bij het hoveren over een bar
var tip = d3.tip()
    .attr("class", "tooltip")
    .offset([-10, 0])
    .html(function(d) {return "<strong>Life expectancy (" + d.type + "):</strong> " + d.value;});

barsvg.call(tip);

// Kleuren van colorbrewer
var colors = colorbrewer.Greens[5];

// Laad eerst de csv in zodat deze aangeroepen kan worden bij een klik op de kaart
d3.csv("betterlifeindex.csv", function(error, rows) {
    if (error) throw error;

    // Laad de json in
    d3.json("lifeexpectancy.json", function(errorjson, json) {
        if (errorjson) throw errorjson;

        // Missende landen toevoegen, zodat grijze gebieden ook een popup krijgen
        var missing = {"GRL": "Greenland", "GUF": "French Guiana", "PSE": "Palestine",
            "CIV": "Ivory Coast", "COG": "Republic of the Congo", "TZA": "Tanzania",
            "LAO": "Laos", "PRK": "North Korea", "ATF": "French Southern and Antarctic Lands",
            "FLK": "Falkland Islands", "PRI": "Puerto Rico", "ESH": "Western Sahara",
            "TWN": "Taiwan", "NCL": "New Caledonia", "-99": "Missing codes"};

        for (key in missing) {
            var cobj = {"Overall": "NA", "Female": "NA", "Male": "NA"};
            cobj.name = missing.key;
            json[key] = cobj;
        }

        // Maak de datamap aan
        var map = new Datamap({
            // Het HTML element voor de map heeft de id "map"
            element: document.getElementById("map"),
            // De scope is de hele wereld
            scope: 'world',
            // De kleuren die geassocieerd worden met de keys
            fills: {
                LOW: colors[0],
                BELAVG: colors[1],
                AVG: colors[2],
                ABVAVG: colors[3],
                HIGH: colors[4],
                defaultFill: "#8F8F8F"
            },
            // Schaal en verschuif de kaart
            setProjection: function(element) {
                var projection = d3.geo.mercator()
                    .center([40, 10])
                    .rotate([0, 0])
                    .scale(175)
                    .translate([element.offsetWidth / 2, element.offsetHeight / 2]);

                    var path = d3.geo.path()
                        .projection(projection);

                return {path: path, projection: projection};
            },
            // De data is de ingeladen json met de missende waarden
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
                    // Als een land zonder data voor de barchart wordt aangeklikt:
                    if (missing.hasOwnProperty(geo.id)) {
                        // Zet de y-as uit
                        d3.select(".y.axis").transition()
                            .duration(750)
                            .style("opacity", 0);

                        // Maak een custom object met waarden 0 om de bars 'uit te faden'
                        updateBars({
                            name: geo.properties.name,
                            Overall: 0,
                            Female: 0,
                            Male: 0
                        });
                    }
                    else {
                        // Zet de y-as aan als er data is voor de barchart
                        d3.select(".y.axis").transition()
                            .duration(750)
                            .style("opacity", 1);

                        // Update de barchart met de data van het land uit de json
                        updateBars(json[geo.id]);
                    }

                    // Pak data van het land uit de csv
                    var tableinfo = rows.filter(function(d) {return d.LOCATION === geo.id;});
                    // Als het land in de csv voorkomt, geef de array mee om de tabel te updaten
                    if (tableinfo.length !== 0) {
                        updateTable(tableinfo);
                    }
                    // Geef anders een custom array mee met waarden "NA"
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
                LOW: "0-50",
                BELAVG: "51-60",
                AVG: "61-70",
                ABVAVG: "71-80",
                HIGH: "81+"
            }
        });

        // Roep de x-as aan
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
