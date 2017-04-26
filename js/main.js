var apiKey = "509f21739e774d29bf5a6c3b01e127af";
var selectedAccountType = 2;
var bungieStuff = 'https://www.bungie.net/Platform/Destiny/';

var raidNames = ["Vault of Glass",
  "Crota's End",
  "King's Fall",
  "Wrath of the Machine",
];

var raidMod = ["Normal", "Heroic", "Age of Triumph"]

var raidActivityHash = [2659248071, 2659248068, 856898338,
  1836893116, 1836893119, 4000873610,
  1733556769, 3534581229, 3978884648,
  1387993552, 260765522, 3356249023
];


function findUser() {
  var username = $("#gamerTag").val()

  if(username === ''){
    $("#usernameform").addClass("has-danger");
    $("#feedback").text("I don't have time to explain why I need your username.");

    return;
  }

  var mid;
  var req = bungieStuff + 'SearchDestinyPlayer/' + selectedAccountType + '/' + username

  $.ajax({
    url: req,
    headers : {"X-API-Key": apiKey},
    datatype: "json",
    success : function(data){
      if (data.Response.length === 0) {
        $("#usernameform").addClass("has-danger");
        $("#feedback").text(username + " is forever lost in the dark corners of time.");

      } else {
        mid = data.Response[0].membershipId;
        $("#usernameform").addClass("has-success");
        $("#feedback").text("Guardians make their own fate.");

        getAccountSummary(mid);

      }
    },
    error: function(err){
      console.log(err)
    }
  });

}


function getAccountSummary(mid) {
  var req = bungieStuff + selectedAccountType + '/Account/' + mid + "/Summary/"

  $.ajax({
    url: req,
    headers : {"X-API-Key": apiKey},
    datatype: "json",
    success : function(data){
      var characters = data.Response.data.characters;
      var grimoire = data.Response.data.grimoireScore;

      $("#grimore").text("Grimoire Score: " + grimoire);

      for (var i = 0; i < characters.length; i++) {
        var cid = characters[i].characterBase.characterId;
        var desc = characterDscr(characters[i].characterBase)
        getActivities(mid, cid, i, desc);
      }
    },
    error: function(err){
      console.log(err)
    }
  });

}

function characterDscr(cb) {
  var cd = {
    2803282938: "Awoken",
    898834093: "Exo",
    3887404748: "Human",

    671679327: "Hunter",
    2271682572: "Warlock",
    3655393761: "Titan",

    2204441813: "Female",
    3111576190: "Male"

  }

  var raceHash = cb.raceHash
  var classHash = cb.classHash
  var genderHash = cb.genderHash
  var light = cb.powerLevel

  var dscr = [light, cd[genderHash], cd[raceHash], cd[classHash]]
  return (dscr.join(" "));

}

function getActivities(mid, cid, idx, desc) {
  var req = bungieStuff + '/Stats/AggregateActivityStats/' + selectedAccountType + '/' + mid + "/" + cid;

  $.ajax({
    url: req,
    headers : {"X-API-Key": apiKey},
    datatype: "json",
    success : function(data){
      var activities = data.Response.data.activities;
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

      tableCreate("ch" + idx + "box", completions, timePlayed, desc)

    },
    error: function(err){
      console.log(err)
    }
  });
}


function tableCreate(pid, completions, timePlayed, title) {
  var parent = document.getElementById(pid);
  parent.innerHTML = ''
  var tbl = document.createElement('table');
  tbl.className = 'table table-sm table-hover'
  var cap = tbl.createTHead();
  cap.innerHTML = "<b>" + title + "</b>"
  for (var i = 0; i < 12; i++) {

    if (i % 3 === 0){
      var tr = tbl.insertRow();
      var td = tr.insertCell();
      var raidtitle = document.createElement("b");
      raidtitle.innerHTML = raidNames[i / 3];
      td.appendChild(raidtitle);
    }

    var tr = tbl.insertRow();

    if (completions[i] === 0) {
      tr.className = 'table-danger';
    }

    var td = tr.insertCell();
    td.appendChild(document.createTextNode(raidMod[i % 3]));

    var td = tr.insertCell();
    td.appendChild(document.createTextNode(completions[i]));

    var td = tr.insertCell();
    td.appendChild(document.createTextNode(timePlayed[i]));

  }
  parent.appendChild(tbl);
}



function summary() {
  $("#usernameform").removeClass("has-danger has-success");
  $("#feedback").text("Wait for Ghost to open the door ...");
  $("#grimore").html("");
  $("#ch0box").html("");
  $("#ch1box").html("");
  $("#ch2box").html("");
  findUser();
}


$(document).ready(function() {
  console.log("page ready");
  $('#usernameform').submit(function(e) {
    e.preventDefault();
    console.log("form submit");
    summary();
  });
});
