import sys
import json
import os

# Version of path
version = None 

games_to_process = 5

with open('ap_items.set') as f:
    # items that give at least 1 AP
    ap_items = set(map(int, f.readlines()))
with open('big_items.set') as f:
    # items that cost at least 1000 gold (in total)
    big_items = set(map(int, f.readlines()))
with open('full_items.set') as f:
    # items that cannot be upgraded (upgrade != transform) 
    full_items = set(map(int, f.readlines()))

# Example: {69: "Lich Bane"} which means Lich Bane is id 69
item_id_to_name = {} 

# Example: {69: 25} which means Lich Bane was played in 25 game
games_played = {}

# Example: {69: 25} which means Lich Bane was purchased 25 time
num_of_purchases = {}

# Example: {69: 25} which means 25 Lich Bane purchases won
purchases_won = {}

total_games = 0

# Example: {1: 25} means champion ID 1 was played 25 times
champion_games_played = {}

# Example: {1: 25} means champion 1 won 25 ranked games
champion_games_won = {}

# Example: {1: "Akali"} means champion with ID 1 is Akali
champion_id_to_name = {}

# Example: {1: {3000: 69}} means 69 champions with ID 1 bought item #3000.
# {champion: {item: # of times purchased}}
champion_item_purchased = {}

# Example: {1: {(1, 2, 3, 4, 5, 6):10}} there 10 people to built champion with ID 1 with items 1,2,3,4,5,6
# The item build must be sorted in a tuple
champion_build = {}

# Example: {1: {(1, 2, 3, 4, 5, 6):10}} there 10 people to built champion with ID 1 with items 1,2,3,4,5,6 that won the game
# The item build must be sorted in a tuple
champion_winning_build = {}

def is_ap(item):
    return item in ap_items

def get_build_orders(events, filter_set = None):
    """
    get build order for all players
    input: timeline data[, set to filter by]
    output: dict of participant -> list of tuple (itemId:int, timeInMilli:int)
    """
    result = {(i+1):[] for i in range(10)}
    for event in events:
        if event['eventType'] == 'ITEM_PURCHASED':
            result[event['participantId']].append((event['itemId'], event['timestamp']))
    for event in events:
        if event['eventType'] == 'ITEM_UNDO':
            index = -1
            for i, (itemId, timestamp) in enumerate(result[event['participantId']]):
                print event
                if itemId == event['itemBefore']:
                    index = i
            if index == -1: 
                raise RuntimeError("couldn't find undone item")
            result[event['participantId']].pop(index)
    return result

def load_items():
    global item_id_to_name
    with open('item' + version + '.json', 'r') as items:
        data = json.load(items)
        for key in data["data"]:
            item_id_to_name[key] = data["data"][key]["name"]

def load_champions():
    global champion_id_to_name
    with open('champion' + version + '.json', 'r') as champs:
        data = json.load(champs)
        for key in data["data"]:
            champ = key
            id = data["data"][champ]["key"]
            champion_id_to_name[id] = champ

def process(path):
    global total_games, purchases_won, num_of_purchases, games_played
    total_files = 0
    print "Computing number of files"
    for dirpath, dirnames, filenames in os.walk(path):
        total_files += len(filenames)
         
    progress_counter = 0.0
    for dirpath, dirnames, filenames in os.walk(path):
        print "Processing %s" % dirpath
        fullnames = [os.path.join(dirpath, f) for f in filenames]

        for f in fullnames:
            progress_counter += 1.0
            sys.stderr.write("\rProgress: %f%%" % (progress_counter / total_files * 100)) 
            total_games += 1
            if total_games > games_to_process:
                exit()
            with open(f) as json_input:
                local_items_played = set()
                try:
                    data = json.load(json_input)
                except:
                    print "Something wrong with this file", f 

                if "participants" not in data:
                    # Something weird happened
                    print "Check", f
                    continue

                timeline = data['timeline']
                events = []
                for frame in timeline['frames']:
                    if 'events' in frame:
                        events += frame['events']

                #print get_build_orders(events) 
                for player in data["participants"]:
                    won = player["stats"]["winner"]
                    champ = player["championId"]
                    champ_items = []

                    num_ap = 0
                    # Process item related info
                    for j in range(7):
                        item = player["stats"]["item"+str(j)]
                        if item == 0:
                            continue
                        if is_ap(item): num_ap+=1
                        champ_items.append(item)
                        local_items_played.add(item)
                        num_of_purchases[item] = num_of_purchases.get(item, 0) + 1
                        if won:
                            purchases_won[item] = purchases_won.get(item, 0) + 1
                        
                        if champ not in champion_item_purchased:
                            champion_item_purchased[champ] = {}
                        if item not in champion_item_purchased[champ]:
                            champion_item_purchased[champ][item] = 0 
                        champion_item_purchased[champ][item] += 1

                    print "%s bought %d ap items" % (champion_id_to_name[str(champ)], num_ap)
                    # Process champion related info
                    champion_games_played[champ] = champion_games_played.get(champ, 0) + 1
                    if won:
                        champion_games_won[champ] = champion_games_won.get(champ, 0) + 1

                    # Ignore non full builds
                    if len(champ_items) == 7:
                        champ_items.sort()
                        champ_items = tuple(champ_items)
                        if champ not in champion_build:
                            champion_build[champ] = {}
                        if champ_items not in champion_build[champ]:
                            champion_build[champ][champ_items] = 0
                        champion_build[champ][champ_items] += 1 

                        if won:
                            if champ not in champion_winning_build:
                                champion_winning_build[champ] = {}
                            if champ_items not in champion_winning_build[champ]:
                                champion_winning_build[champ][champ_items] = 0
                            champion_winning_build[champ][champ_items] += 1 

                for j in local_items_played:
                    games_played[j] = games_played.get(j, 0) + 1

def main():
    if len(sys.argv) < 3:
        print """Please specify path to match JSON files and patch version (11/14) 
              For example, "python process.py NA/{path} 11 """
        return
    else:
        print "Loading JSON files in", sys.argv[1] 
    global version
    version = sys.argv[2]
    load_items()
    load_champions()
    process(sys.argv[1])

    with open('item_%s.csv'%version,'w') as f:
        for key in games_played:
            f.write("%s,%d,%f,%f\n" % (item_id_to_name[str(key)],key,float(num_of_purchases.get(key, 0)) / total_games,float(purchases_won.get(key, 0)) / num_of_purchases.get(key, 0)))

    with open('champ_%s.csv'%version,'w') as f:
        for key in champion_games_played:
            f.write("%s,%d,%f,%f\n" % (champion_id_to_name[str(key)],key,float(champion_games_played.get(key, 0)) / total_games,float(champion_games_won.get(key, 0)) / champion_games_played.get(key, 0)))
    
    with open('champ_items_%s.csv'%version,'w') as f:
        f.write("Champion Name, Champion Key, ")
        for item in item_id_to_name:
            f.write(item_id_to_name[item] + " bought, ")
        f.write("\n")
            
        for key in champion_item_purchased:
            f.write(champion_id_to_name[str(key)] + ", " + str(key) + ", ")
            for item in item_id_to_name:
                if int(item) not in champion_item_purchased[(key)]:
                    f.write("0, ")
                else:
                    f.write(str(float(champion_item_purchased[key][int(item)]) / champion_games_played[key]) + ", ")
            f.write("\n")

    with open('champ_build_%s.csv' % version, 'w') as f:
        f.write("Champion Name, Champion Key, Most Frequent Build, Most Frequent Winning Build\n") 
        for key in champion_build:
            count, build = max((v, k) for k, v in champion_build[key].items())
            build = [item_id_to_name[str(i)] for i in build]
            if key in champion_winning_build:
                win_count, win_build = max((v, k) for k, v in champion_winning_build[key].items())
                win_build = [item_id_to_name[str(i)] for i in win_build]
            else:
                win_build = []
            f.write("%s, %d, %s, %s\n" % (champion_id_to_name[str(key)], key, str(build).replace(",", ";"), str(win_build).replace(",", ";")))
            
if __name__ == "__main__":
    main()
