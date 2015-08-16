import requests
import json
import os
from os import path
from time import sleep

api_key = open('eddy.apikey').read().strip()
input_directory = path.join('AP_ITEM_DATASET','5.11','RANKED_SOLO')
output = 'output'
output_directory = path.join(input_directory, output) 

apiBaseUrl = {
    'br': 'https://br.api.pvp.net/', 
    'eune': 'https://eune.api.pvp.net/', 
    'euw': 'https://euw.api.pvp.net/', 
    'kr': 'https://kr.api.pvp.net/', 
    'lan': 'https://lan.api.pvp.net/', 
    'las': 'https://las.api.pvp.net/', 
    'na': 'https://na.api.pvp.net/', 
    'oce': 'https://oce.api.pvp.net/', 
    'tr': 'https://tr.api.pvp.net/', 
    'ru': 'https://ru.api.pvp.net/', 
    'global': 'https://global.api.pvp.net/'
}

match_api = 'api/lol/%s/v2.2/match/%s'

if not path.exists(input_directory):
    raise IOError("Input directory %s does not exist" % input_directory)

if not path.exists(output_directory):
    print "creating output directory %s" % output_directory
    os.mkdir(output_directory)


for f in [f for f in os.listdir(input_directory) if path.isfile(path.join(input_directory, f))]:
    region = f[:-5]
    if region != 'NA': continue #only NA supported for now
    if not path.exists(path.join(output_directory, region)):
        os.mkdir(path.join(output_directory, region))
        print "creating output directory %s" % path.join(output_directory, region)
    games = json.load(open(path.join(input_directory,f)))
    for i,game in enumerate(games):
        filename = path.join(output_directory, region, str(game) + '.json')
        if not path.isfile(filename):
            print "Downloading %s (%d of %d)" % (filename, i+1, len(games))
            r = requests.get(apiBaseUrl[region.lower()] + match_api % (region.lower(), game), params={'api_key': api_key, 'includeTimeline': 'true'})
            while r.status_code == 429:
                print "Retrying in 10 seconds"
                sleep(10)
                r = requests.get(apiBaseUrl[region.lower()] + match_api % (region.lower(), game), params={'api_key': api_key, 'includeTimeline': 'true'})
            outfile = open('temp', 'w')
            outfile.write(r.text.encode('utf-8'))
            outfile.close()
            try:
                os.rename('temp',filename)
            except:
                os.remove('temp')
                os.remove(filename)
            sleep(1.5)
