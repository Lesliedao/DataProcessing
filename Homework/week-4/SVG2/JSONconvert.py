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

import json
import pattern
from pattern.web import URL, DOM

def save_html(filename, html):
    with open(filename, 'wb') as f:
        f.write(html)
       
def make_json(url):
    json_dict = {}
    json_dict['data'] = 'percentage renewable energy'
    
    html = url.download()
    dom = DOM(DOM(html).by_class("wikitable")[1].content)
    
    countrylist = dom.by_tag("tr")[1:]
    pointslist = []
    for countryinfo in countrylist:
        infopair = []
        
        infopair.append(DOM(countryinfo.content).by_tag("a")[0].attrs.get("title","").encode("utf-8"))
        infopair.append(DOM(countryinfo.content).by_tag("td")[8].content.encode("utf-8"))
        
        pointslist.append(infopair)
        
    json_dict['points'] = pointslist
    
    json.dump(json_dict, open('json.txt', 'wb'))
    



# MAIN       
wikiURL = URL('https://en.wikipedia.org/wiki/List_of_countries_by_electricity_production_from_renewable_sources')
wikiHTML = wikiURL.download(cached=True)
save_html('renewableenergy.html', wikiHTML)

make_json(wikiURL)