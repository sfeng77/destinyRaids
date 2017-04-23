#!/usr/bin/python
import sys
import requests
# import os
# os.environ['NO_PROXY'] = 'bungie.net'


raidNames = ["Vault of Glass", "Vault of Glass Heroic", "Vault of Glass AoT",
             "Crota's End", "Crota's End Heroic", "Crota's End AoT",
             "King's Fall", "King's Fall Heroic", "King's Fall AoT",
             "Wrath of the Machine", "Wrath of the Machine Heroic",
             "Wrath of the Machine AoT"]

raidActivityHash = [2659248071, 2659248068, 856898338,
                    1836893116, 1836893119, 4000873610,
                    1733556769, 3534581229, 3978884648,
                    1387993552, 260765522, 3356249023
                    ]

characterHashes = {
    2803282938: "Awoken",
    898834093: "Exo",
    3887404748: "Human",

    671679327: "Hunter",
    2271682572: "Warlock",
    3655393761: "Titan",

    2204441813: "Female",
    3111576190: "Male"
}

apiKey = "cd2254b7d1d24127abb7a98a3b0ea10e"
HEADERS = {"X-API-Key": apiKey}
BUNGIE = "http://www.bungie.net/platform/Destiny/"
AccountType = "2"


def findUser(username):
    url = BUNGIE + 'SearchDestinyPlayer/' + AccountType + '/' + username
    # print url
    r = requests.get(url, headers=HEADERS, timeout=5)
    res = r.json()
    # print res
    if res['Response'] == []:
        print "Username not found!"
        exit(0)
    return res['Response'][0]['membershipId']


def findCharacters(membershipId):
    url = BUNGIE + AccountType + '/Account/' + membershipId + "/Summary/"
    r = requests.get(url, headers=HEADERS, timeout=5)
    res = r.json()
    # print res['Response'].keys()
    print "Grimore Score: ", res['Response']['data']['grimoireScore']
    characters = res['Response']['data']['characters']
    for c in characters:
        genderHash = c['characterBase']['genderHash']
        raceHash = c['characterBase']['raceHash']
        classHash = c['characterBase']['classHash']
        desc = " ".join(characterHashes[h] for h in [genderHash, raceHash, classHash])
        print desc
        characterId = c['characterBase']['characterId']
        print "=============================================="
        findRaidCompletions(membershipId, characterId)

    url = BUNGIE + 'Stats/Account/' + AccountType + '/' + membershipId
    r = requests.get(url, headers=HEADERS, timeout=5)
    res = r.json()

    print "deleted:"

    characters = res['Response']['characters']
    for c in characters:
        if c['deleted'] == True:
            print "=============================================="
            findRaidCompletions(membershipId, c['characterId'])


def findRaidCompletions(membershipId, characterId):
    url = BUNGIE + '/Stats/AggregateActivityStats/' + AccountType + '/' + membershipId + "/" + characterId
    r = requests.get(url, headers=HEADERS, timeout=5)
    res = r.json()
    activities = res['Response']['data']['activities']
    completions = ['0'] * 12
    timePlayed = ["0h 0m"] * 12
    for act in activities:
        for j in range(12):
            if act['activityHash'] == raidActivityHash[j]:
                completions[j] = act['values']['activityCompletions']['basic']['displayValue']
                timePlayed[j] = act['values']['activitySecondsPlayed']['basic']['displayValue']
    for i in range(12):
        print "%27s" % raidNames[i] + '\t' + str(completions[i]) + '\t' + timePlayed[i]
        if (i + 1) % 3 == 0:
            print "----------------------------------------------"
    print "=============================================="


def main():
    argc = len(sys.argv)
    if argc >= 2:
        username = sys.argv[1]
    else:
        username = raw_input("PSN username: ")
    membershipId = findUser(username)
    # print membershipId
    findCharacters(membershipId)


if __name__ == '__main__':
    main()
