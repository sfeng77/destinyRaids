// var apiKey = "f27abba92256495495a7f9499a8c8f8e";
var apiKey = "509f21739e774d29bf5a6c3b01e127af";
var selectedAccountType = 2;
var bungieStuff = 'https://www.bungie.net/Platform/Destiny/';

var raidNames = ["Vault of Glass",
  "Vault of Glass Heroic",
  "Vault of Glass AoT",
  "Crota's End",
  "Crota's End Heroic",
  "Crota's End AoT",
  "King's Fall",
  "King's Fall Heroic",
  "King's Fall AoT",
  "Wrath of the Machine",
  "Wrath of the Machine Heroic",
  "Wrath of the Machine AoT"
];



var raidActivityHash = [2659248071, 2659248068, 856898338,
  1836893116, 1836893119, 4000873610,
  1733556769, 3534581229, 3978884648,
  1387993552, 260765522, 3356249023
];


function findUser() {
  var username = document.getElementById("gamerTag").value;
  var membershipId;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", bungieStuff + 'SearchDestinyPlayer/' + selectedAccountType + '/' + username, true);
  xhr.setRequestHeader("X-API-Key", apiKey);

  xhr.onreadystatechange = function() {
    //console.log(this.readyState)
    //console.log(this.status)
    if (this.readyState === 4 && this.status === 200) {
      // console.log(this.responseText)
      var json = JSON.parse(this.responseText);
      // console.log(json.Response)
      if (json.Response.length === 0) {
        $("#usernameform").addClass("has-danger");
        $("#usernameform #feedback").text("Guardian not found!");

      } else {
        membershipId = json.Response[0].membershipId;
        $("#usernameform").addClass("has-success");
        $("#usernameform #feedback").text("Guardian Record Located");


        // console.log(membershipId);
        //findGrimore(membershipId);
        getAccountSummary(membershipId);

      }

    }
  }

  xhr.send();

}


function getAccountSummary(membershipId) {
  var xhr = new XMLHttpRequest();
  var req = bungieStuff + selectedAccountType + '/Account/' + membershipId + "/Summary/"
  xhr.open("GET", req, true);
  xhr.setRequestHeader("X-API-Key", apiKey);

  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      var json = JSON.parse(this.responseText);
      // console.log(json);
      var characters = json.Response.data.characters;
      var grimore = json.Response.data.grimoireScore;

      $("#grimore").text("Grimore Score: " + grimore);

      for (var i = 0; i < characters.length; i++) {
        characterId = characters[i].characterBase.characterId;

        //var objectId = "ch" + i + "summary"
        // printById(objectId, characterDscr(characters[i]));
        var desc = characterDscr(characters[i])
        getActivities(membershipId, characterId, i, desc);
      }
    }
  }

  xhr.send();
}

function characterDscr(character) {
  var characterHashes = {
    2803282938: "Awoken",
    898834093: "Exo",
    3887404748: "Human",

    671679327: "Hunter",
    2271682572: "Warlock",
    3655393761: "Titan",

    2204441813: "Female",
    3111576190: "Male"

  }

  raceHash = character.characterBase.raceHash
  classHash = character.characterBase.classHash
  genderHash = character.characterBase.genderHash

  var dscr = [characterHashes[genderHash], characterHashes[raceHash], characterHashes[classHash]]
  return (dscr.join(" "));

}

function getActivities(membershipId, characterId, characterIdx, desc) {
  var xhr = new XMLHttpRequest();
  var req = bungieStuff + '/Stats/AggregateActivityStats/' + selectedAccountType + '/' + membershipId + "/" + characterId;
  xhr.open("GET", req, true);
  xhr.setRequestHeader("X-API-Key", apiKey);

  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      var json = JSON.parse(this.responseText);
      // console.log(json);
      var activities = json.Response.data.activities;
      var completionsString = "";
      var completions = new Array(12).fill(0);
      var timePlayed = new Array(12).fill("0h 0m");
      for (var i = 0; i < activities.length; i++) {
        for (var j = 0; j < raidActivityHash.length; j++) {
          if (activities[i].activityHash === raidActivityHash[j]) {
            completions[j] = activities[i].values.activityCompletions.basic.value;
            timePlayed[j] = activities[i].values.activitySecondsPlayed.basic.displayValue;
          }
        }
      }

      tableCreate("ch" + characterIdx + "box", completions, timePlayed, desc)

    }
  }

  xhr.send();
}


function tableCreate(pid, completions, timePlayed, title) {
  var parent = document.getElementById(pid);
  parent.innerHTML = ''
  var tbl = document.createElement('table');
  tbl.className = 'table table-striped table-sm table-hover'
  var cap = tbl.createTHead();
  cap.innerHTML = "<b>" + title + "</b>"
  for (var i = 0; i < 12; i++) {
    var tr = tbl.insertRow();

    if (completions[i] === 0) {
      tr.className = 'table-danger';
    }

    var td = tr.insertCell();
    td.appendChild(document.createTextNode(raidNames[i]));

    var td = tr.insertCell();
    td.appendChild(document.createTextNode(completions[i]));

    var td = tr.insertCell();
    td.appendChild(document.createTextNode(timePlayed[i]));

  }
  parent.appendChild(tbl);
}



function summary() {
  // console.log(location.origin);
  $("#usernameform").removeClass("has-danger has-success");
  $("#usernameform #feedback").text("Looking for the guardian");
  findUser();
  //alert(grimore);
}


$("#usernameform").submit(function() {
  console.log("form submit");
  summary();
});

$(document).ready(function() {
  console.log("page ready");
  // $("#js-warning").hide();
});
