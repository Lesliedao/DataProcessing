##
# Leslie Dao
# 10561234
#
# Neemt een link van geografisch geindexeerde data van wikipedia en maakt er een JSON van.
# In dit specifieke geval:
# https://en.wikipedia.org/wiki/List_of_countries_by_electricity_production_from_renewable_sources
#
# Dit is slechts een hulpscript dat een JSON object maakt van wikipedia informatie
##

# Libraries voor het dumpen van JSON en het scrapen
import json
import pattern
from pattern.web import URL, DOM

# Backup html file opslaan
def save_html(filename, html):
    with open(filename, 'wb') as f:
        f.write(html)
       
# Functie om een dictionary te maken en dan te dumpen als JSON in een .txt file
def make_json(url):
    json_dict = {}
    # Geef de data een titel
    json_dict['data'] = 'percentage renewable energy'
    
    # Pak de DOM van de tabel van alle landen
    html = url.download()
    dom = DOM(DOM(html).by_class("wikitable")[1].content)
    
    # Maak een list met info over de landen
    countrylist = dom.by_tag("tr")[1:]
    
    # Lege list om de data aan te appenden
    pointslist = []
    for countryinfo in countrylist:
    	# Lege list om land en percentage renewable energy aan te appenden
        infopair = []
        
        # Neem de naam van het land en append dat aan infopair
        infopair.append(DOM(countryinfo.content).by_tag("a")[0].attrs.get("title","").encode("utf-8"))
        # Neem het percentage renewable energy van het land en append dat aan infopair
        infopair.append(DOM(countryinfo.content).by_tag("td")[8].content.encode("utf-8"))
        
        # Append de list aan pointslist voor een nested list
        pointslist.append(infopair)
        
	# Geef de dictionary de key 'points' met value de nested list pointslist
    json_dict['points'] = pointslist
    
    # Dump de dictionary als JSON naar de textfile json.txt
    json.dump(json_dict, open('json.txt', 'wb'))
    

# MAIN functie
# Variabelen voor de URL en HTML
wikiURL = URL('https://en.wikipedia.org/wiki/List_of_countries_by_electricity_production_from_renewable_sources')
wikiHTML = wikiURL.download(cached=True)

# Maak een backup van de pagina
save_html('renewableenergy.html', wikiHTML)

# Roep make_json aan om JSON te dumpen
make_json(wikiURL)