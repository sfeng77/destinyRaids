var apiKey = '509f21739e774d29bf5a6c3b01e127af';
var selectedAccountType = 2;
var bungieStuff = 'https://www.bungie.net/Platform/Destiny/';

var waitText = 'Ghost is trying to open the door...';
var successText = 'Guardians make their own fate.';
var notFoundText = ' is forever lost in the dark corners of time.';
var emptyFormText = 'I don\'t have time to explain why I need your username.';
var emptyDataText = "Guardian, type your PSN username to get started.";

var raidCompleteText = ["DNF", "Complete"];

var deletedCharacterName = 'Deleted Character';

var raidNames = ['Vault of Glass', 'Crota\'s End', 'King\'s Fall', 'Wrath of the Machine'];

var raidMod = ['Normal', 'Heroic', 'Age of Triumph'];

var raidActivityHash = [
  2659248071,
  2659248068,
  856898338,
  1836893116,
  1836893119,
  4000873610,
  1733556769,
  3534581229,
  3978884648,
  1387993552,
  260765522,
  3356249023
];

var weaponKillsId = [
  'weaponKillsAutoRifle', 'weaponKillsHandCannon', 'weaponKillsPulseRifle', 'weaponKillsScoutRifle',
  'weaponKillsFusionRifle', 'weaponKillsShotgun', 'weaponKillsSideArm', 'weaponKillsSniper',
  'weaponKillsRocketLauncher', 'weaponKillsMachinegun', 'weaponKillsSword',
  'weaponKillsGrenade', 'weaponKillsMelee', 'weaponKillsSuper', 'weaponKillsRelic'
];

var weaponKillsLabel = [
  'AutoRifle', 'HandCannon', 'PulseRifle', 'ScoutRifle',
  'FusionRifle', 'Shotgun', 'SideArm', 'Sniper',
  'RocketLauncher', 'Machinegun', 'Sword',
  'Grenade', 'Melee', 'Super', 'Relic'
];

var weaponClass = [
  'Primary', 'Primary', 'Primary', 'Primary',
  'Special', 'Special', 'Special', 'Special',
  'Heavy', 'Heavy', 'Heavy',
  'Ability', 'Ability', 'Ability', 'Ability'
];

var weaponClassColor = {
  'Primary': '#bdbdbd',
  'Special': '#007E33',
  'Heavy': '#aa66cc',
  'Ability': '#4285F4'
};

function findUser() {
  var username = $('#username').val().trim();

  if (username === '') {
    $('#usernameform').addClass('has-danger');
    $('#feedback').text(emptyFormText);
    return;
  }

  var req = bungieStuff + 'SearchDestinyPlayer/' + selectedAccountType + '/' + username + '/';

  $.ajax({
    method: 'get',
    url: req,
    headers: {
      'X-API-Key': apiKey
    },
    datatype: 'json',
    success: function (data) {
      if (data.Response.length === 0) {
        $('#usernameform').addClass('has-danger');
        $('#feedback').text(username + notFoundText);
      } else {
        var mid = data.Response[0].membershipId;
        $('#usernameform').addClass('has-success');
        $('#feedback').text(successText);

        getAccountSummary(mid);
      }
    },
    error: function (err) {
      console.log(err);
    }
  });
}

function getAccountSummary(mid) {
  var req = bungieStuff + selectedAccountType + '/Account/' + mid + '/Summary/';

  $.ajax({
    url: req,
    headers: {
      'X-API-Key': apiKey
    },
    datatype: 'json',
    success: function (data) {
      var characters = data.Response.data.characters;

      for (var i = 0; i < characters.length; i++) {
        var cid = characters[i].characterBase.characterId;
        var desc = characterDscr(characters[i].characterBase);
        getActivities(mid, cid, desc);
        getRecent(mid, cid, desc);

      }

      var grimoire = data.Response.data.grimoireScore;
      addStat('Grimoire Score', grimoire);

    },
    error: function (exception) {
      console.log(exception);
    }
  });

  req = bungieStuff + 'Stats/Account/' + selectedAccountType + '/' + mid + '/';

  $.ajax({
    url: req,
    headers: {
      'X-API-Key': apiKey
    },
    datatype: 'json',
    success: function (data) {
      // console.log(data)
      var characters = data.Response.characters;
      for (var i = 0; i < characters.length; i++) {
        if (characters[i].deleted === true) {
          var cid = characters[i].characterId;
          getActivities(mid, cid, deletedCharacterName);
        }
      }

      var mergedStats = data.Response.mergedAllCharacters;
      var timePlayed = mergedStats.merged.allTime.totalActivityDurationSeconds.basic.displayValue;
      addStat('Time Played', timePlayed);

      var pveStats = mergedStats.results.allPvE.allTime;
      var pvpStats = mergedStats.results.allPvP.allTime;

      addStat('PvE Kills', pveStats.kills.basic.displayValue);
      addStat('PvP K/D', pvpStats.killsDeathsRatio.basic.displayValue);

      addStat('PvE Avg. Kill Distance', pveStats.averageKillDistance.basic.displayValue);
      addStat('PvP Avg. Kill Distance', pvpStats.averageKillDistance.basic.displayValue);

      weaponKills("PvE Kills Breakdown", mergedStats.results.allPvE.allTime);
      weaponKills("PvP Kills Breakdown", mergedStats.results.allPvP.allTime);

    },
    error: function (err) {
      console.log(err);
    }
  });
}

function getRecent(mid, cid, desc) {
  var req = bungieStuff + 'Stats/ActivityHistory/' + selectedAccountType + '/' + mid + '/' + cid + '/?mode=raid&definitions=true&count=5';
  $.ajax({
    method: 'get',
    url: req,
    headers: {
      'X-API-Key': apiKey
    },
    datatype: 'json',
    success: function (data) {
      //console.log(data);
      var chbox = document.createElement('div');
      chbox.className = 'card';
      var heading = document.createElement('h5');
      heading.className = 'card-header';
      heading.innerHTML = desc;
      chbox.append(heading);
      var chCol = document.createElement('div');
      chCol.className = 'col-xs-12 col-md-6 col-lg-4';
      chCol.append(chbox);
      $('#recentgames').append(chCol);

      var acts = data.Response.data.activities;
      var gameXHRs = [],
        gametitle = [],
        gamelength = [],
        gamecompletion = [],
        activityID = [];

      $.each(acts, function (index, value) {
        var actHash = value.activityDetails.referenceId;
        gametitle[index] = data.Response.definitions.activities[actHash].activityName;
        gamecompletion[index] = value.values.completed.basic.value;
        gamelength[index] = value.values.activityDurationSeconds.basic.displayValue;
        activityID[index] = value.activityDetails.instanceId;
        var req = bungieStuff + 'Stats/PostGameCarnageReport/' + activityID[index] + '/';
        gameXHRs[index] = getRequest(req);
      });

      var gameReports = [];
      $.when.apply($, gameXHRs).done(function () {
        $.each(arguments, function (index, arg) {
          gameReports[index] = {
            standing: arg[2].responseJSON.Response.data.entries,
            gameTitle: gametitle[index],
            completed: gamecompletion[index],
            length: gamelength[index],
            gameId: cid+activityID[index]
          };
        });
        gameReportTable(gameReports, chbox);

      });
    },
    error: function (err) {
      console.log(err);
    }
  });
}

function getRequest(req) {
  return $.ajax({
    url: req,
    headers: {
      'X-API-Key': apiKey
    },
    datatype: 'json'
  });
}

function gameReportTable(reports, chbox) {

  var tbl = document.createElement('table');
  tbl.className = 'table table-sm table-hover';

  $.each(reports, function (index, report) {
    console.log(report);
    var tbody = document.createElement("tbody");
    tbl.append(tbody);
    tr = tbody.insertRow();
    tr.className = "clickable "+['table-danger', 'table-success'][report.completed];
    tr.setAttribute("data-toggle", "collapse");
    tr.setAttribute("data-target", '#'+report.gameId);

    td = tr.insertCell();
    var raidtitle = document.createElement('b');
    raidtitle.innerHTML = report.gameTitle;
    td.appendChild(raidtitle);
    td = tr.insertCell();
    td.appendChild(document.createTextNode(raidCompleteText[report.completed]));
    td = tr.insertCell();
    td.appendChild(document.createTextNode(report.length));

    tbody = document.createElement("tbody");
    tbl.append(tbody);
    tbody.className = "collapse";
    tbody.id = report.gameId;

    tr = tbody.insertRow();
    td = tr.insertCell();
    td.innerHTML = ('<b>Guardian</b>');
    td = tr.insertCell();
    td.innerHTML = ('<b>Kills</b>');
    td = tr.insertCell();
    td.innerHTML = ('<b>Deaths</b>');

    $.each(report.standing, function (index, player){
      tr = tbody.insertRow();
      td = tr.insertCell();
      td.appendChild(document.createTextNode(player.player.destinyUserInfo.displayName));
      td = tr.insertCell();
      td.appendChild(document.createTextNode(player.values.kills.basic.displayValue));
      td = tr.insertCell();
      td.appendChild(document.createTextNode(player.values.deaths.basic.displayValue));
    });
  });

  chbox.append(tbl);
}

function weaponKills(statName, stats) {
  var n = weaponKillsId.length;
  var kills = new Array(n).fill(0);
  var colors = new Array(n);

  for (var i = 0; i < n; i++) {
    kills[i] = stats[weaponKillsId[i]].basic.value;
    colors[i] = weaponClassColor[weaponClass[i]];
  }

  var data = [{
    y: kills,
    x: weaponKillsLabel,
    marker: {
      color: colors
    },
    type: 'bar'
  }];
  var layout = {
    autosize: true,
    title: statName
  };

  mydiv = document.createElement('div');
  $('#charts').append(mydiv);
  Plotly.newPlot(mydiv, data, layout);
}

function addStat(statName, statValue) {
  var gs = document.createElement('div');
  gs.className = 'card';

  var gt = document.createElement('b');
  gt.className = 'card-header';
  gt.innerHTML = statName;

  gs.append(gt);

  var score = document.createElement('h2');
  score.align = 'right';
  score.innerHTML = statValue;

  var gb = document.createElement('div');
  gb.className = 'card-block';

  gb.append(score);
  gs.append(gb);

  var col = document.createElement('div');
  col.className = 'col-xs-6 col-md-3';
  col.append(gs);
  $('#summary').append(col);
}

function characterDscr(cb) {
  var cd = {
    2803282938: 'Awoken',
    898834093: 'Exo',
    3887404748: 'Human',

    671679327: 'Hunter',
    2271682572: 'Warlock',
    3655393761: 'Titan',

    2204441813: 'Female',
    3111576190: 'Male'
  };

  var raceHash = cb.raceHash;
  var classHash = cb.classHash;
  var genderHash = cb.genderHash;
  var light = cb.powerLevel;

  var dscr = [light, cd[genderHash], cd[raceHash], cd[classHash]];
  return (dscr.join(' '));
}

function getActivities(mid, cid, title) {
  var req = bungieStuff + '/Stats/AggregateActivityStats/' + selectedAccountType + '/' + mid + '/' + cid + '/';

  $.ajax({
    url: req,
    headers: {
      'X-API-Key': apiKey
    },
    datatype: 'json',
    success: function (data) {
      // console.log(data)
      var activities = data.Response.data.activities;
      var completions = new Array(12).fill(0);
      var timePlayed = new Array(12).fill('0h 0m');
      for (var i = 0; i < activities.length; i++) {
        for (var j = 0; j < raidActivityHash.length; j++) {
          if (activities[i].activityHash === raidActivityHash[j]) {
            completions[j] = activities[i].values.activityCompletions.basic.value;
            timePlayed[j] = activities[i].values.activitySecondsPlayed.basic.displayValue;
          }
        }
      }

      tableCreate(completions, timePlayed, title);
    },
    error: function (err) {
      console.log(err);
    }
  });
}

function tableCreate(completions, timePlayed, title) {
  var chCard = document.createElement('div');
  chCard.className = 'card';

  var chSum = document.createElement('h5');
  chSum.className = 'card-header';
  chSum.innerHTML = title;

  chCard.appendChild(chSum);

  var tbl = document.createElement('table');
  tbl.className = 'table table-sm table-hover';

  var tr,
    td;
  for (var i = 0; i < 12; i++) {
    if (i % 3 === 0) {
      tr = tbl.insertRow();
      tr.className = 'table-info';
      td = tr.insertCell();
      td.colSpan = '3';
      var raidtitle = document.createElement('b');
      raidtitle.innerHTML = raidNames[i / 3];
      td.appendChild(raidtitle);
    }

    tr = tbl.insertRow();

    if (completions[i] === 0) {
      tr.className = 'table-danger';
    }

    td = tr.insertCell();
    td.appendChild(document.createTextNode(raidMod[i % 3]));

    td = tr.insertCell();
    td.appendChild(document.createTextNode(completions[i]));

    td = tr.insertCell();
    td.appendChild(document.createTextNode(timePlayed[i]));
  }
  chCard.appendChild(tbl);

  var chCol = document.createElement('div');
  chCol.className = 'col-xs-12 col-md-6 col-lg-4';
  chCol.append(chCard);
  if (title === deletedCharacterName) {
    $('#deletedchstats').append(chCol);
    $('#deletedTab').show(100);
  } else {
    $('#chstats').append(chCol);
  }
}

function summary() {
  $('#usernameform').removeClass('has-danger has-success');
  $('#feedback').text(waitText);
  $('.data-pane').empty();
  $('.nav-tabs a[href="#raids"]').tab('show');
  $('#deletedTab').hide(100);

  findUser();
}

$(document).ready(function () {
  $('#deletedTab').hide();
  $('.data-pane').text(emptyDataText);
  $('#usernameform').submit(function (e) {
    e.preventDefault();
    summary();
  });
});
