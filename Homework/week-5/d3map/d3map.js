/*
/ Leslie Dao
/ 10561234
/
/ Maakt een datamap met percentages renewable energy
/ Data van: https://en.wikipedia.org/wiki/List_of_countries_by_electricity_production_from_renewable_sources
/ gescrapet met JSONconvert.py
*/

// Nieuwe datamap aanmaken voor de data
var map = new Datamap({
    // Het HTML element voor de map heeft de id "map"
    element: document.getElementById("map"),
    // De scope is de hele wereld (in eerste instantie)
    scope: 'world',
    // De kleuren die geassocieerd worden met de keys
    fills: {
        LOW: "#EDF8E9",
        BELAVG: "#BAE4B3",
        AVG: "#74C476",
        ABVAVG: "#31A354",
        HIGH: "#006D2C",
        defaultFill: "#8F8F8F"
    },
    /*
    / De dataset is niet compleet, dus voor een groot gedeelte van Afrika en
    / Zuid-Amerika mist de data en is de datamap grijs. Zoom daarom in op Europa,
    / waar de data voor de meeste landen wel beschikbaar is (met setProjection).
    / Voor landen in view waarvan de data wel mist, wordt de waarde "NA" handmatig
    / aan het eind van 'data' toegevoegd.
    */
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
    // Dit is de data verkregen met de scraper (incompleet volgens wikipedia)
    data: {
        "DZA": {"name": "Algeria", "value": 1.14, "fillKey": "LOW"},
        "AGO": {"name": "Angola", "value": 71.96, "fillKey": "ABVAVG"},
        "EGY": {"name": "Egypt", "value": 9.48, "fillKey": "LOW"},
        "BGD": {"name": "Bangladesh", "value": 4.11, "fillKey": "LOW"},
        "NAM": {"name": "Namibia", "value": 88.59, "fillKey": "HIGH"},
        "BGR": {"name": "Bulgaria", "value": 12.11, "fillKey": "LOW"},
        "BOL": {"name": "Bolivia", "value": 34.94, "fillKey": "BELAVG"},
        "GHA": {"name": "Ghana", "value": 68.26, "fillKey": "ABVAVG"},
        "PAK": {"name": "Pakistan", "value": 31.85, "fillKey": "BELAVG"},
        "CPV": {"name": "Cape Verde", "value": 2.28, "fillKey": "LOW"},
        "JOR": {"name": "Jordan", "value": 0.44, "fillKey": "LOW"},
        "MYS": {"name": "Malaysia", "value": 7.75, "fillKey": "LOW"},
        "PRI": {"name": "Puerto Rico", "value": 0.74, "fillKey": "LOW"},
        "PRK": {"name": "North Korea", "value": 71.25, "fillKey": "ABVAVG"},
        "TZA": {"name": "Tanzania", "value": 30.22, "fillKey": "BELAVG"},
        "PRT": {"name": "Portugal", "value": 44.49, "fillKey": "AVG"},
        "KHM": {"name": "Cambodia", "value": 38.91, "fillKey": "BELAVG"},
        "PRY": {"name": "Paraguay", "value": 99.99, "fillKey": "HIGH"},
        "LBN": {"name": "Lebanon", "value": 7.13, "fillKey": "LOW"},
        "SVN": {"name": "Slovenia", "value": 28.92, "fillKey": "BELAVG"},
        "BFA": {"name": "Burkina Faso", "value": 18.58, "fillKey": "LOW"},
        "SVK": {"name": "Slovakia", "value": 20.35, "fillKey": "BELAVG"},
        "MRT": {"name": "Mauritania", "value": 13.04, "fillKey": "LOW"},
        "HRV": {"name": "Croatia", "value": 50.27, "fillKey": "AVG"},
        "CHL": {"name": "Chile", "value": 37.7, "fillKey": "BELAVG"},
        "CHN": {"name": "China", "value": 21.05, "fillKey": "BELAVG"},
        "JAM": {"name": "Jamaica", "value": 9.26, "fillKey": "LOW"},
        "GIN": {"name": "Guinea", "value": 56.64, "fillKey": "AVG"},
        "FIN": {"name": "Finland", "value": 41.82, "fillKey": "AVG"},
        "URY": {"name": "Uruguay", "value": 62.98, "fillKey": "ABVAVG"},
        "THA": {"name": "Thailand", "value": 8.75, "fillKey": "LOW"},
        "NPL": {"name": "Nepal", "value": 99.49, "fillKey": "HIGH"},
        "LAO": {"name": "Laos", "value": 92.04, "fillKey": "HIGH"},
        "PHL": {"name": "Philippines", "value": 29.62, "fillKey": "BELAVG"},
        "ZAF": {"name": "South Africa", "value": 1.01, "fillKey": "LOW"},
        "NIC": {"name": "Nicaragua", "value": 41.14, "fillKey": "AVG"},
        "ROU": {"name": "Romania", "value": 26.43, "fillKey": "BELAVG"},
        "SYR": {"name": "Syria", "value": 10.87, "fillKey": "LOW"},
        "MLT": {"name": "Malta", "value": 0.75, "fillKey": "LOW"},
        "KAZ": {"name": "Kazakhstan", "value": 8.78, "fillKey": "LOW"},
        "SUR": {"name": "Suriname", "value": 34.29, "fillKey": "BELAVG"},
        "DMA": {"name": "Dominica", "value": 27.08, "fillKey": "BELAVG"},
        "BEN": {"name": "Benin", "value": 1.3, "fillKey": "LOW"},
        "NGA": {"name": "Nigeria", "value": 20.55, "fillKey": "BELAVG"},
        "BEL": {"name": "Belgium", "value": 13.76, "fillKey": "LOW"},
        "TGO": {"name": "Togo", "value": 85.32, "fillKey": "HIGH"},
        "DEU": {"name": "Germany", "value": 24.38, "fillKey": "BELAVG"},
        "LKA": {"name": "Sri Lanka", "value": 30.32, "fillKey": "BELAVG"},
        "GBR": {"name": "United Kingdom", "value": 11.99, "fillKey": "LOW"},
        "MWI": {"name": "Malawi", "value": 87.16, "fillKey": "HIGH"},
        "CRI": {"name": "Costa Rica", "value": 92.24, "fillKey": "HIGH"},
        "CMR": {"name": "Cameroon", "value": 74.05, "fillKey": "ABVAVG"},
        "MAR": {"name": "Morocco", "value": 9.24, "fillKey": "LOW"},
        "LSO": {"name": "Lesotho", "value": 100.0, "fillKey": "HIGH"},
        "HUN": {"name": "Hungary", "value": 8.14, "fillKey": "LOW"},
        "TKM": {"name": "Turkmenistan", "value": 0.02, "fillKey": "LOW"},
        "TTO": {"name": "Trinidad and Tobago", "value": 0.23, "fillKey": "LOW"},
        "NLD": {"name": "Netherlands", "value": 12.72, "fillKey": "LOW"},
        "GEO": {"name": "Georgia (country)", "value": 75.47, "fillKey": "ABVAVG"},
        "MNE": {"name": "Montenegro", "value": 53.22, "fillKey": "AVG"},
        "BLZ": {"name": "Belize", "value": 96.69, "fillKey": "HIGH"},
        "MMR": {"name": "Myanmar", "value": 73.39, "fillKey": "ABVAVG"},
        "AFG": {"name": "Afghanistan", "value": 80.32, "fillKey": "HIGH"},
        "BDI": {"name": "Burundi", "value": 99.01, "fillKey": "HIGH"},
        "BLR": {"name": "Belarus", "value": 0.69, "fillKey": "LOW"},
        "GRC": {"name": "Greece", "value": 17.56, "fillKey": "LOW"},
        "ZWE": {"name": "Zimbabwe", "value": 69.75, "fillKey": "ABVAVG"},
        "MOZ": {"name": "Mozambique", "value": 99.87, "fillKey": "HIGH"},
        "TJK": {"name": "Tajikistan", "value": 95.45, "fillKey": "HIGH"},
        "HTI": {"name": "Haiti", "value": 14.51, "fillKey": "LOW"},
        "IND": {"name": "India", "value": 15.2, "fillKey": "LOW"},
        "IRL": {"name": "Republic of Ireland", "value": 20.23, "fillKey": "BELAVG"},
        "BTN": {"name": "Bhutan", "value": 99.99, "fillKey": "HIGH"},
        "VCT": {"name": "Saint Vincent and the Grenadines", "value": 18.25, "fillKey": "LOW"},
        "VNM": {"name": "Vietnam", "value": 44.85, "fillKey": "AVG"},
        "NOR": {"name": "Norway", "value": 98.47, "fillKey": "HIGH"},
        "CZE": {"name": "Czech Republic", "value": 9.79, "fillKey": "LOW"},
        "FJI": {"name": "Fiji", "value": 67.58, "fillKey": "ABVAVG"},
        "HND": {"name": "Honduras", "value": 45.05, "fillKey": "AVG"},
        "MUS": {"name": "Mauritius", "value": 21.7, "fillKey": "BELAVG"},
        "DOM": {"name": "Dominican Republic", "value": 13.77, "fillKey": "LOW"},
        "LUX": {"name": "Luxembourg", "value": 15.43, "fillKey": "LOW"},
        "ISR": {"name": "Israel", "value": 0.8, "fillKey": "LOW"},
        "PER": {"name": "Peru", "value": 57.63, "fillKey": "AVG"},
        "IDN": {"name": "Indonesia", "value": 12.01, "fillKey": "LOW"},
        "MKD": {"name": "Republic of Macedonia", "value": 17.41, "fillKey": "LOW"},
        "COD": {"name": "Democratic Republic of the Congo", "value": 99.58, "fillKey": "HIGH"},
        "COG": {"name": "Republic of the Congo", "value": 62.39, "fillKey": "ABVAVG"},
        "ISL": {"name": "Iceland", "value": 99.98, "fillKey": "HIGH"},
        "ETH": {"name": "Ethiopia", "value": 99.43, "fillKey": "HIGH"},
        "COM": {"name": "Comoros", "value": 6.98, "fillKey": "LOW"},
        "COL": {"name": "Colombia", "value": 82.44, "fillKey": "HIGH"},
        "MDA": {"name": "Moldova", "value": 4.87, "fillKey": "LOW"},
        "MDG": {"name": "Madagascar", "value": 65.93, "fillKey": "ABVAVG"},
        "ECU": {"name": "Ecuador", "value": 56.16, "fillKey": "AVG"},
        "SEN": {"name": "Senegal", "value": 10.67, "fillKey": "LOW"},
        "SRB": {"name": "Serbia", "value": 28.96, "fillKey": "BELAVG"},
        "FRA": {"name": "France", "value": 15.52, "fillKey": "LOW"},
        "LTU": {"name": "Lithuania", "value": 30.02, "fillKey": "BELAVG"},
        "RWA": {"name": "Rwanda", "value": 43.55, "fillKey": "AVG"},
        "ZMB": {"name": "Zambia", "value": 99.71, "fillKey": "HIGH"},
        "SWE": {"name": "Sweden", "value": 60.21, "fillKey": "ABVAVG"},
        "FRO": {"name": "Faroe Islands", "value": 39.5, "fillKey": "BELAVG"},
        "GTM": {"name": "Guatemala", "value": 68.08, "fillKey": "ABVAVG"},
        "DNK": {"name": "Denmark", "value": 50.73, "fillKey": "AVG"},
        "UKR": {"name": "Ukraine", "value": 5.95, "fillKey": "LOW"},
        "AUS": {"name": "Australia", "value": 13.47, "fillKey": "LOW"},
        "AUT": {"name": "Austria", "value": 78.39, "fillKey": "ABVAVG"},
        "VEN": {"name": "Venezuela", "value": 65.99, "fillKey": "ABVAVG"},
        "KEN": {"name": "Kenya", "value": 76.17, "fillKey": "ABVAVG"},
        "TUR": {"name": "Turkey", "value": 28.31, "fillKey": "BELAVG"},
        "ALB": {"name": "Albania", "value": 99.98, "fillKey": "HIGH"},
        "ITA": {"name": "Italy", "value": 32.67, "fillKey": "BELAVG"},
        "TUN": {"name": "Tunisia", "value": 1.93, "fillKey": "LOW"},
        "RUS": {"name": "Russia", "value": 16.59, "fillKey": "LOW"},
        "MEX": {"name": "Mexico", "value": 15.73, "fillKey": "LOW"},
        "BRA": {"name": "Brazil", "value": 83.98, "fillKey": "HIGH"},
        "GNQ": {"name": "Equatorial Guinea", "value": 7.0, "fillKey": "LOW"},
        "USA": {"name": "United States", "value": 12.56, "fillKey": "LOW"},
        "WSM": {"name": "Samoa", "value": 38.14, "fillKey": "BELAVG"},
        "AZE": {"name": "Azerbaijan", "value": 8.31, "fillKey": "LOW"},
        "SWZ": {"name": "Swaziland", "value": 29.41, "fillKey": "BELAVG"},
        "CAN": {"name": "Canada", "value": 64.48, "fillKey": "ABVAVG"},
        "KOR": {"name": "South Korea", "value": 1.43, "fillKey": "LOW"},
        "CAF": {"name": "Central African Republic", "value": 85.64, "fillKey": "HIGH"},
        "CHE": {"name": "Switzerland", "value": 61.96, "fillKey": "ABVAVG"},
        "CYP": {"name": "Cyprus", "value": 5.8, "fillKey": "LOW"},
        "BIH": {"name": "Bosnia and Herzegovina", "value": 31.03, "fillKey": "BELAVG"},
        "UZB": {"name": "Uzbekistan", "value": 22.24, "fillKey": "BELAVG"},
        "ERI": {"name": "Eritrea", "value": 0.59, "fillKey": "LOW"},
        "POL": {"name": "Poland", "value": 11.04, "fillKey": "LOW"},
        "GAB": {"name": "Gabon", "value": 43.01, "fillKey": "AVG"},
        "EST": {"name": "Estonia", "value": 13.03, "fillKey": "LOW"},
        "ESP": {"name": "Spain", "value": 30.99, "fillKey": "BELAVG"},
        "IRQ": {"name": "Iraq", "value": 9.22, "fillKey": "LOW"},
        "SLV": {"name": "El Salvador", "value": 60.71, "fillKey": "ABVAVG"},
        "MLI": {"name": "Mali", "value": 76.29, "fillKey": "ABVAVG"},
        "LVA": {"name": "Latvia", "value": 67.79, "fillKey": "ABVAVG"},
        "IRN": {"name": "Iran", "value": 5.25, "fillKey": "LOW"},
        "SLE": {"name": "Sierra Leone", "value": 68.97, "fillKey": "ABVAVG"},
        "PAN": {"name": "Panama", "value": 64.14, "fillKey": "ABVAVG"},
        "NZL": {"name": "New Zealand", "value": 72.93, "fillKey": "ABVAVG"},
        "JPN": {"name": "Japan", "value": 12.66, "fillKey": "LOW"},
        "KGZ": {"name": "Kyrgyzstan", "value": 93.79, "fillKey": "HIGH"},
        "UGA": {"name": "Uganda", "value": 82.92, "fillKey": "HIGH"},
        "NCL": {"name": "New Caledonia", "value": 14.73, "fillKey": "LOW"},
        "ARG": {"name": "Argentina", "value": 31.08, "fillKey": "BELAVG"},
        "SDN": {"name": "Sudan", "value": 72.73, "fillKey": "ABVAVG"},
        "ARM": {"name": "Armenia", "value": 30.22, "fillKey": "BELAVG"},
        "PNG": {"name": "Papua New Guinea", "value": 32.84, "fillKey": "BELAVG"},
        "CUB": {"name": "Cuba", "value": 3.96, "fillKey": "LOW"},
        // Missende landen een hovertext geven
        "GRL": {"name": "Greenland", "value": "NA"},
        "SAU": {"name": "Saudi Arabia", "value": "NA"},
        // Missende 3-letter codes van landen
        "-99": {"name": "Missing codes", "value": "NA"}
    },
    // Stel de custom popup message in
    geographyConfig: {
        // Geef het gehighlighte land een zwarte border
        highlightBorderColor: 'rgba(0,0,0,0.5)',
        popupTemplate: function(geo, data) {
            return ['<div class="hoverinfo"><strong>',
                    geo.properties.name, ': ' + data.value,
                    '</strong></div>'].join('');
        }
    }
});

// Maak een legenda voor de datamap met custom waarden
map.legend({
    // Titel van de legenda
    legendTitle: "Legend",
    // Label voor de default fill (waar geen data voor is)
    defaultFillName: "No data",
    // Custom labels voor de fill kleuren (waar wel data voor is)
    labels: {
        LOW: "0% - 20%",
        BELAVG: "20% - 40%",
        AVG: "40% - 60%",
        ABVAVG: "60% - 80%",
        HIGH: "80% - 100%"
    }
});
