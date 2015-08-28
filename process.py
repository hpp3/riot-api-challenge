import sys
import json
import os

# Version of path
version = None 

# Example: {69: "Lich Bane"} which means Lich Bane is id 69
item_id_to_name = {} 

# Example: {69: 25} which means Lich Bane was played in 25 game
games_played = {}

# Example: {69: 25} which means Lich Bane was purchased 25 time
num_of_purchases = {}

# Example: {69: 25} which means 25 Lich Bane purchases won
purchases_won = {}

total_games = 0

def load_items():
    global item_id_to_name
    with open('item' + version + '.json', 'r') as items:
        data = json.load(items)
        for key in data["data"]:
            item_id_to_name[key] = data["data"][key]["name"]

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

                for player in data["participants"]:
                    won = player["stats"]["winner"]
                    for j in range(7):
                        item = player["stats"]["item"+str(j)]
                        if item == 0:
                            continue
                        local_items_played.add(item)
                        num_of_purchases[item] = num_of_purchases.get(item, 0) + 1
                        if won:
                            purchases_won[item] = purchases_won.get(item, 0) + 1
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
    process(sys.argv[1])

    with open('item_pop_%s.csv'%version,'w') as f:
        for key in games_played:
            f.write("%s,%d,%f\n" % (item_id_to_name[str(key)],key,float(num_of_purchases[key]) / total_games))

    with open('item_win_%s.csv'%version,'w') as f:
        for key in purchases_won:
            f.write("%s,%d,%f\n" % (item_id_to_name[str(key)],key,float(purchases_won[key]) / num_of_purchases[key]))
    
    with open('item_%s.csv'%version,'w') as f:
        for key in games_played:
            f.write("%s,%d,%f,%f\n" % (item_id_to_name[str(key)],key,float(games_played[key]) / total_games,float(purchases_won[key]) / num_of_purchases[key]))

if __name__ == "__main__":
    main()
