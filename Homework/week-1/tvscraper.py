#!/usr/bin/env python
# Name: Leslie Dao
# Student number: 10561234
# De indents op GitHub zijn anders dan in een tekstverwerker
# In een tekstverwerker staan de comments recht boven de bijhorende code
'''
Dit script scrapet informatie van de IMDb website en schrijft de 50 beste TV series naar een .csv bestand
'''
import csv

from pattern.web import URL, DOM

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    '''
    Extract a list of highest ranking TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Ranking
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RANKING TV-SERIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.
    
	# Maak een lege list aan om de informatie in op te slaan
    scrape = []

	# Scrape de titels van de series
	# De plaatjes hebben een attribute "title" met de titel en jaar als value
    for img in dom.by_tag("img"):
    	title = img.attrs.get("title","")
		# Als de titels unicode bevatten, encode deze dan zodat ze goed weergegeven worden
    	title = title.encode("utf-8")
		# De titel zonder het achtervoegsel (20XX TV Series) of trailing spatie
    	title = title[:title.find("(") - 1]
    	# Als het veld leeg was, was het geen titel dus laat deze weg
        if title == "":
    		pass
		# Anders append de titel aan de lege list
    	else:
    		scrape.append(title)
    
    # Het eerste element van de list is "Go to IMDb Pro", dus verwijder deze	
    scrape.pop(0)
    
    # Scrape de rankings van de series
	# De rankings zitten tussen de tags met class "value"
    for rank in dom.by_class("value"):
		# Gebruik de content method om wat er tussen de tags zit te parsen en append het aan scrape
    	rank = rank.content.encode("utf-8")
    	# Als de rating mist, append dan "N/A"
    	if rank == "":
    		scrape.append("N/A")
    	else:
    		scrape.append(rank)
    
    # Scrape de genres
    for genres in dom.by_class("genre"):
		# Houd een lijst bij voor als een serie meerdere genres heeft
    	genlist = []
		# Maak een DOM van de content van genres om daarin apart de tags te accessen
    	genres = DOM(genres.content)
		# Sommige series hebben meerdere genres dus parse ze apart
    	for genre in genres:
			# De genres-DOM neemt ook niet-tags mee, dus houd hier rekening mee met try/except
			# Als het om een tag gaat, append deze inhoud dan aan de genlist
    		try:
    			genlist.append(genre.content.encode("utf-8"))
			# Anders sla over (er hoeft niks geparset te worden)
    		except AttributeError:
    			pass
    	
		# Voeg de geparste genres uit de genlist samen in een string en append ze aan scrape
    	genres = ", ".join(genlist)
    	# Als de genres missen, append dan "None"
    	if genres == "":
    		scrape.append("None")
    	else:
    		scrape.append(genres)
    	
    # Scrape de acteurs
	# De acteurs zitten in de span met de class "credit"
    for actors in dom.by_class("credit"):
		# Maak net als bij de genres een lijst voor meerdere acteurs
    	actorlist = []
		# Maak weer een DOM van de acteurs zodat de tags daarin apart bekeken kunnen worden
    	actors = DOM(actors.content)
		# Probeer de acteurs apart te parsen en sla over als het niet om een tag gaat
    	for actor in actors:
    		try:
    			actorlist.append(actor.content.encode("utf-8"))
    		except AttributeError:
    			pass
    	
		# Voeg de acteurs uit de actorlist samen in een string en append ze aan scrape
    	actors = ", ".join(actorlist)
    	# Als de acteurs missen, append dan "None"
    	if actors == "":
    		scrape.append("None")
    	else:
    		scrape.append(actors)
    
    # Scrape de runtimes
	# De runtimes staan tussen tags met class "runtime"
    for runtime in dom.by_class("runtime"):
    	runtime = runtime.content
		# Pak alleen het getal en niet "mins." door te splicen, encode en append aan scrape
		# Als de runtime mist, vul dan -1 in
    	runtime = runtime[:runtime.find(" ")].encode("utf-8")
    	if runtime == "":
    		scrape.append("-1")
    	else:
    		scrape.append(runtime)
    
	# Omdat een grote array niet door de test komt, hoewel de output .csv file exact hetzelfde is,
	# maak nieuwe array voor nested lists. Elke serie krijgt zijn eigen list in deze nieuwe list
    allseries = []	
    # Er wordt gekeken naar de 50 beste series, dus er zijn 50 lists in de nieuwe list
    for i in range(50):
		# Nested list voor elke serie
    	tvserie = []
		# Append de titel, ranking, genres, acteurs en runtime van de serie. Ze staan 50 elementen uit elkaar
    	tvserie.append(scrape[i])
    	tvserie.append(scrape[i + 50])
    	tvserie.append(scrape[i + 100])
    	tvserie.append(scrape[i + 150])
    	tvserie.append(scrape[i + 200])
		# Append deze list aan de grote list voor nested lists
    	allseries.append(tvserie)
    
	# Return de nested lists
    return allseries  # replace this line as well as appropriate


def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest ranking TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Ranking', 'Genre', 'Actors', 'Runtime'])
	# Schrijf 50 rows naar de .csv file
	# Omdat de tvseries list een nested list is, kan elke index als row geschreven worden
    for i in range(50):
    	writer.writerow(tvseries[i])
    	
    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE TV-SERIES TO DISK

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in testing / grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)
    # print dom

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)
