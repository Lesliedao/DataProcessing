#!/usr/bin/env python
'''
Test the scraper that collects the highest ranking TV schows.
'''
import unittest
import csv
import StringIO

from pattern.web import DOM

from tvscraper import OUTPUT_CSV, BACKUP_HTML
from tvscraper import extract_tvseries, save_csv


class CheckOutputMixin(object):
    def test_check_header(self):
        # This checks whether the header is present in the CSV 
        self.assertEquals(
            self.rows[0],
            ['Title', 'Ranking', 'Genre', 'Actors', 'Runtime']
        )

    def test_check_n_rows(self):
        # Checks that there are 50 rows and 1 header row
        self.assertEquals(len(self.rows), 51)

    def test_check_n_columns(self):
        # * Each row should have the same number of columns.
        # * Each row should have 5 columns
        lengths = set()
        for row in self.rows:
            lengths.add(len(row))
        self.assertEquals(len(lengths), 1)
        self.assertEquals(lengths.pop(), 5)

    def test_check_runtimes(self):
        # * The runtime column should be a number (not include min)
        for row in self.rows[1:]:
            if row[-1]:
                runtime = int(row[-1])


class CheckSavedCSV(unittest.TestCase, CheckOutputMixin):
    def setUp(self):
        with open(OUTPUT_CSV, 'rb') as f:
            self.rows = list(csv.reader(f))


class CheckExtractionAndSave(unittest.TestCase, CheckOutputMixin):
    def setUp(self):
        with open(BACKUP_HTML, 'r') as f:
            dom = DOM(f.read())
            # Add the header for now as the extract_tvseries function does not
            # add a header itself.
            self.rows = [['Title', 'Ranking', 'Genre', 'Actors', 'Runtime']]
            self.rows.extend(extract_tvseries(dom))

    def test_save(self):
        # for testing use an in memory 'file'
        buffer = StringIO.StringIO()
        # Be sure to take the extra header of again since save_csv does add
        # the header when saving the file.
        save_csv(buffer, self.rows[1:])

        # If everything works as intended we should be back with a CSV 'file'
        # that contains 51 lines (header + content).
        rows = list(csv.reader(StringIO.StringIO(buffer.getvalue())))  # :(
        self.assertEquals(len(rows), 51)

if __name__ == '__main__':
    print 'Test IMDB scraper.'
    print 'By checking saved CSV and whether the saved HTML can be scraped'
    print 'using your code. You should see no ERRORs or FAILs below.\n'
    unittest.main()
