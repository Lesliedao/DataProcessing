#!/usr/bin/env python
# Name: Leslie Dao
# Student number: 10561234
'''
This script scrapes IMDB and outputs a CSV file with highest ranking tv series.
'''
# IF YOU WANT TO TEST YOUR ATTEMPT, RUN THE test-tvscraper.py SCRIPT.
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
    
    scrape = []

	# scrape de titels van de series
    for img in dom.by_tag("img"):
    	title = img.attrs.get("title","")
    	title = title.encode("utf-8")	
    	title = title[:title.find("(") - 1]
    	if title == "":
    		pass
    	else:
    		scrape.append(title)
    
    # het eerste element van de list is "Go to IMDb Pro"	
    scrape.pop(0)
    
    # scrape de rankings van de series
    for span in dom.by_class("value"):
    	span = span.content.encode("utf-8")
    	scrape.append(span)
    
    # scrape de genres
    for genres in dom.by_class("genre"):
    	genlist = []
    	genres = DOM(genres.content)
    	for genre in genres:
    		try:
    			genlist.append(genre.content.encode("utf-8"))
    		except AttributeError:
    			pass
    			
    	genres = ", ".join(genlist)
    	scrape.append(genres)
    	
    # scrape de acteurs
    for actors in dom.by_class("credit"):
    	actorlist = []
    	actors = DOM(actors.content)
    	for actor in actors:
    		try:
    			actorlist.append(actor.content.encode("utf-8"))
    		except AttributeError:
    			pass
    	
    	actors = ", ".join(actorlist)
    	scrape.append(actors)
    
    # scrape de runtimes
    for runtime in dom.by_class("runtime"):
    	runtime = runtime.content
    	runtime = runtime[:runtime.find(" ")]
    	scrape.append(runtime)
    	
    #print scrape
    #print len(scrape)
    return scrape  # replace this line as well as appropriate


def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest ranking TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Ranking', 'Genre', 'Actors', 'Runtime'])
    for i in range(50):
    	row = [tvseries[i], tvseries[i + 50], tvseries[i + 100], tvseries[i + 150], tvseries[i + 200]]
    	writer.writerow(row)
    	
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
