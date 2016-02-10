#!/usr/bin/env python
# Name: Leslie Dao
# Student number: 10561234
# De indentaties in github kunnen weer verschillen van de indentaties in een tekstverwerker
'''
This script crawls the IMDB top 250 movies.
'''
# Python standard library imports
import os
import sys
import csv
import codecs
import cStringIO
import errno

# Third party library imports:
import pattern
from pattern.web import URL, DOM

# --------------------------------------------------------------------------
# Constants:
TOP_250_URL = 'http://www.imdb.com/chart/top'
OUTPUT_CSV = 'top250movies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

# --------------------------------------------------------------------------
# Unicode reading/writing functionality for the Python CSV module, taken
# from the Python.org csv module documentation (very slightly adapted).
# Source: http://docs.python.org/2/library/csv.html (retrieved 2014-03-09).

class UTF8Recoder(object):
    """
    Iterator that reads an encoded stream and reencodes the input to UTF-8
    """
    def __init__(self, f, encoding):
        self.reader = codecs.getreader(encoding)(f)

    def __iter__(self):
        return self

    def next(self):
        return self.reader.next().encode("utf-8")


class UnicodeReader(object):
    """
    A CSV reader which will iterate over lines in the CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        f = UTF8Recoder(f, encoding)
        self.reader = csv.reader(f, dialect=dialect, **kwds)

    def next(self):
        row = self.reader.next()
        return [unicode(s, "utf-8") for s in row]

    def __iter__(self):
        return self


class UnicodeWriter(object):
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        self.writer.writerow([s.encode("utf-8") for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)

# --------------------------------------------------------------------------
# Utility functions (no need to edit):

def create_dir(directory):
    '''
    Create directory if needed.

    Args:
        directory: string, path of directory to be made


    Note: the backup directory is used to save the HTML of the pages you
        crawl.
    '''

    try:
        os.makedirs(directory)
    except OSError as e:
        if e.errno == errno.EEXIST:
            # Backup directory already exists, no problem for this script,
            # just ignore the exception and carry on.
            pass
        else:
            # All errors other than an already exising backup directory
            # are not handled, so the exception is re-raised and the 
            # script will crash here.
            raise


def save_csv(filename, rows):
    '''
    Save CSV file with the top 250 most popular movies on IMDB.

    Args:
        filename: string filename for the CSV file
        rows: list of rows to be saved (250 movies in this exercise)
    '''
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)  # implicitly UTF-8
        writer.writerow([
            'title', 'runtime', 'genre(s)', 'director(s)', 'writer(s)',
            'actor(s)', 'rating(s)', 'number of rating(s)'
        ])

        writer.writerows(rows)


def make_backup(filename, html):
    '''
    Save HTML to file.

    Args:
        filename: absolute path of file to save
        html: (unicode) string of the html file

    '''

    with open(filename, 'wb') as f:
        f.write(html)


def main():
    '''
    Crawl the IMDB top 250 movies, save CSV with their information.

    Note:
        This function also makes backups of the HTML files in a sub-directory
        called HTML_BACKUPS (those will be used in grading).
    '''

    # Create a directory to store copies of all the relevant HTML files (those
    # will be used in testing).
    print 'Setting up backup dir if needed ...'
    create_dir(BACKUP_DIR)

    # Make backup of the IMDB top 250 movies page
    print 'Access top 250 page, making backup ...'
    top_250_url = URL(TOP_250_URL)
    top_250_html = top_250_url.download(cached=True)
    make_backup(os.path.join(BACKUP_DIR, 'index.html'), top_250_html)

    # extract the top 250 movies
    print 'Scraping top 250 page ...'
    url_strings = scrape_top_250(top_250_url)

    # grab all relevant information from the 250 movie web pages
    rows = []
    for i, url in enumerate(url_strings):  # Enumerate, a great Python trick!
        print 'Scraping movie %d ...' % i
        # Grab web page
        movie_html = URL(url).download(cached=True)

        # Extract relevant information for each movie
        movie_dom = DOM(movie_html)
        rows.append(scrape_movie_page(movie_dom))

        # Save one of the IMDB's movie pages (for testing)
        if i == 83:
            html_file = os.path.join(BACKUP_DIR, 'movie-%03d.html' % i)
            make_backup(html_file, movie_html)

    # Save a CSV file with the relevant information for the top 250 movies.
    print 'Saving CSV ...'
    save_csv(os.path.join(SCRIPT_DIR, 'top250movies.csv'), rows)


# --------------------------------------------------------------------------
# Functions to adapt or provide implementations for:

def scrape_top_250(url):
    '''
    Scrape the IMDB top 250 movies index page.

    Args:
        url: pattern.web.URL instance pointing to the top 250 index page

    Returns:
        A list of strings, where each string is the URL to a movie's page on
        IMDB, note that these URLS must be absolute (i.e. include the http
        part, the domain part and the path part).
    '''
    movie_urls = []
    # YOUR SCRAPING CODE GOES HERE, ALL YOU ARE LOOKING FOR ARE THE ABSOLUTE
    # URLS TO EACH MOVIE'S IMDB PAGE, ADD THOSE TO THE LIST movie_urls.
    
    # Pak de html van de url en maak er een DOM van
    html = url.download()
    dom = DOM(html)
    # Elke url begint met deze root, deze root is nodig voor het absolute pad
    root = 'http://www.imdb.com'
    
    # De url van elke film zit in een td tag met class titleColumn
    for movie in dom.by_class("titleColumn"):
    	# Maak een DOM van de inhoud tussen de td tags om daarin te kunnen zoeken
        movieinfo = DOM(movie.content)
        # Het relatieve pad van elke film is de waarde van 'href' van de eerste 'a' tag
        # Concatenate de root en het relatieve pad voor het absolute pad en append aan movie_urls
        movie_urls.append(root + movieinfo.by_tag("a")[0].attrs.get("href",""))
        
                    
    # return the list of URLs of each movie's page on IMDB
    return movie_urls

# NIEUWE FUNCTIE
def scrape_credit_summary(index, dom):
	# Maak een lege list aan om de info in op te slaan
	infolist = []
	
	# Het inputargument index geeft aan naar welke info gekeken wordt:
	# 0: regisseurs
	# 1: schrijvers
	# 2: eerste drie vermelde acteurs
	infodom = DOM(dom.by_class("credit_summary_item")[index].content)
	# Maak een hulpvariabele i aan
    # Tussen elk van de div tags staan span tags met info over de regisseurs, schrijvers en acteurs
    # Alleen de 'even' span tags bevatten geisoleerde namen
    # Append dus alleen de inhoud van een span tag als het een even span tag is, oftewel
    # als i % 2 == 0
	i = 0
	for info in infodom.by_tag("span"):
		i += 1
		if i % 2 == 0:
			infolist.append(info.content)
		else:
			pass
	
	# Geef de list met info terug
	return infolist

def scrape_movie_page(dom):
    '''
    Scrape the IMDB page for a single movie

    Args:
        dom: pattern.web.DOM instance representing the page of 1 single
            movie.

    Returns:
        A list of strings representing the following (in order): title, year,
        duration, genre(s) (semicolon separated if several), director(s) 
        (semicolon separated if several), writer(s) (semicolon separated if
        several), actor(s) (semicolon separated if several), rating, number
        of ratings.
    '''
    # YOUR SCRAPING CODE GOES HERE:
    # Scrape titel
    # Maak een DOM van de inhoud van de div met id 'ratingWidget'
    titleinfo = DOM(dom.by_id("ratingWidget").content)
    # De titel van de film staat in strong tags
    title = titleinfo.by_tag("strong")[0].content
    
    # Scrape de runtime in minuten
    # De runtime in uren en minuten staat in de eerste 'time' tag
    time = dom.by_tag("time")[0].content
    # Strip de inhoud van die tag zodat er geen leading of trailing spaces zijn en split deze naar uren en minuten
    runtime = time.strip(' \t\r\n').split(" ")
    # Probeer in het eerste element te zoeken naar de index van 'h'
    # Als deze niet te vinden is, returnt de find method -1 en duurt de film dus niet langer dan een uur
    hindex = runtime[0].find("h")
    if hindex == -1:
    	# De film duurt niet langer dan een uur, dus zoek naar de index van 'm'
    	# Er is in dit geval geen tweede element
    	hours = 0
    	minutes = int(runtime[0][:runtime[0].find("m")])
    else:
    	# Als de index van 'h' is gevonden, slice de string dan zodat de 'h' niet meegenomen wordt
    	# Dit is het aantal uren; maak daar een integer van
    	hours = int(runtime[0][:hindex])
    	# Alleen als de film minstens een uur duurt, kan runtime een tweede element hebben
    	# Probeer de index van 'm' te zoeken in dit tweede element en de string te slicen
    	# zodat de 'm' niet meegenomen wordt. Dit is het aantal minuten; maak daar een integer van
    	# Als het tweede element niet bestaat, is er een IndexError en is het aantal minuten dus 0
    	try:
        	minutes = int(runtime[1][:runtime[1].find("m")])
    	except IndexError:
        	minutes = 0
    
    # Bereken de runtime in minuten zonder de ' mins.' suffix en maak daar een string van
    duration = str(60 * hours + minutes)
    
    # Scrape de genres
    # Maak een lege list voor de genres om later te joinen in een string
    genrelist = []
    # De genres staan tussen div tags met class 'see-more inline canwrap'. Daar zijn er twee van
    # De eerste bevat plot keywords en de tweede de genres. Kijk dus naar de tweede
    # Maak een DOM van de inhoud van die div tag
    genreinfo = DOM(dom.by_class("see-more inline canwrap")[1].content)
    # In die DOM staan de genres tussen 'a' tags. Itereer daarover
    for gen in genreinfo.by_tag("a"):
    	# De genres staan tussen de tags en worden voorafgegaan door een spatie
    	# Slice de genre dus zodat de leading space niet wordt meegenomen en append aan genrelist
        genre = gen.content[1:]
        genrelist.append(genre)
    
    # Maak een string van de gevonden genres en splits de genres met '; '    
    genres = "; ".join(genrelist)
    
    # Er zijn drie div tags met class 'credit_summary_item'
    # De eerste (0) daarvan bevat de regisseurs
    # De tweede (1) bevat de schrijvers
    # De laatste (2) bevat de eerste drie vermelde acteurs
    # Zie de functie scrape_credit_summary(index, dom) (hierboven) voor meer info
    
    # Scrape de regisseurs
    # Maak een string van de gevonden regisseurs en splits de regisseurs met '; '        
    directors = "; ".join(scrape_credit_summary(0, dom))
    
    # Scrape de schrijvers
	# Maak een string van de gevonden schrijvers en splits de schrijvers met '; '
    writers = "; ".join(scrape_credit_summary(1, dom))
    
    # Scrape de eerste drie vermelde acteurs
    # Maak een string van de eerste drie vermelde acteurs, gesplitst door '; '
    actors = "; ".join(scrape_credit_summary(2, dom))
    
    # Scrape de rating
    # De rating staat tussen span tags met class 'rating'
    rtg = dom.by_tag('span.rating')[0].content
    # Omdat de rating direct gevolgd wordt door een andere tag (beginnend met <),
    # slice de string zodat hij alleen de rating returnt
    rating = rtg[:rtg.find("<")]
    
    # Scrape het aantal ratings
    # De ratingcount staat tussen span tags met class 'small'
    n_rtgs = dom.by_tag('span.small')[0].content
    # Omdat de ratingcount komma's bevat die de duizendtallen splitst,
    # maak een nieuwe string mbv een list comprehension die alleen de getallen joint
    n_ratings = "".join(x for x in n_rtgs if x.isdigit() == True)
    
    # Return everything of interest for this movie (all strings as specified
    # in the docstring of this function).
    return title, duration, genres, directors, writers, actors, rating, \
        n_ratings


if __name__ == '__main__':
    main()  # call into the progam

    # If you want to test the functions you wrote, you can do that here:
    # ...
