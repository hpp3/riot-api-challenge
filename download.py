import random
import string
import requests
import threading
import json
import os
from os import path
from time import sleep

api_keys = [open('eddy.apikey').read().strip(),
            open('jason.apikey').read().strip()]
api_key = api_keys[0] 
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

def process(api_key, name='N/A'):
    global games
    while (games):
        game, region = games.pop()
        size = len(games)
        filename = path.join(output_directory, region, str(game) + '.json')
        if not path.isfile(filename):
            print "[Thread %s] Downloading %s (%d left)" % (name, filename, size)
            ok = False
            while not ok:
                r = requests.get(apiBaseUrl[region.lower()] + match_api % (region.lower(), game), params={'api_key': api_key, 'includeTimeline': 'true'})
                if r.status_code == 429:
                    print "[Thread %s] Retrying in 10 seconds" % name
                    sleep(10)
                elif r.status_code != 200:
                    print '[Thread %s] received bad status code %s for game %s, retrying in 10s (request was %s, %s)' % (name, r.status_code, game, apiBaseUrl[region.lower()] + match_api % (region.lower(), game), {'api_key': api_key, 'includeTimeline': 'true'})
                    sleep(10)
                    #raise RuntimeError('returned bad status code %s' % r.status_code)
                else:
                    ok = True
            tempname = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8)) 
            outfile = open(tempname, 'w')
            outfile.write(r.text.encode('utf-8'))
            # outfile.close()
            try:
                os.rename(tempname,filename)
            except Exception as e:
                if path.isfile(tempname): os.remove(tempname)
                if path.isfile(filename): os.remove(filename)
                raise e
            sleep(1.4)

for f in [f for f in os.listdir(input_directory) if path.isfile(path.join(input_directory, f))]:
    region = f[:-5]
    #if region != 'NA': continue #only NA supported for now
    if not path.exists(path.join(output_directory, region)):
        os.mkdir(path.join(output_directory, region))
        print "creating output directory %s" % path.join(output_directory, region)
    games = set([(game, region) for game in json.load(open(path.join(input_directory,f))) if not path.isfile(path.join(output_directory, region, str(game) + '.json'))])
    threads = []
    for apikey in api_keys:
        threads.append(threading.Thread(target=process, args=[apikey, ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(3))]))
    for thread in threads:
        thread.daemon = True
        thread.start()
    while all([thread.is_alive() for thread in threads]):
        sleep(10)

