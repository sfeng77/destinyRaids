var apiKey = '509f21739e774d29bf5a6c3b01e127af'
var selectedAccountType = 2
var bungieStuff = 'https://www.bungie.net/Platform/Destiny/'


var waitText = 'Ghost is trying to open the door...'
var successText = 'Guardians make their own fate.'
var notFoundText = ' is forever lost in the dark corners of time.'
var emptyFormText = 'I don\'t have time to explain why I need your username.'

var raidNames = ['Vault of Glass', 'Crota\'s End', 'King\'s Fall', 'Wrath of the Machine']

var raidMod = ['Normal', 'Heroic', 'Age of Triumph']

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
]

function findUser() {
  var username = $('#gamerTag').val().trim()

  if (username === '') {
    $('#usernameform').addClass('has-danger')
    $('#feedback').text(emptyFormText)

    return
  }

  var req = bungieStuff + 'SearchDestinyPlayer/' + selectedAccountType + '/' + username + '/'

  $.ajax({
    method: 'get',
    url: req,
    headers: {
      'X-API-Key': apiKey
    },
    datatype: 'json',
    success: function(data) {
      if (data.Response.length === 0) {
        $('#usernameform').addClass('has-danger')
        $('#feedback').text(username + notFoundText)
      } else {
        var mid = data.Response[0].membershipId
        $('#usernameform').addClass('has-success')
        $('#feedback').text(successText)

        getAccountSummary(mid)
      }
    },
    error: function(err) {
      console.log(err)
    }
  })
}

function getAccountSummary(mid) {
  var req = bungieStuff + selectedAccountType + '/Account/' + mid + '/Summary/'

  $.ajax({
    url: req,
    headers: {
      'X-API-Key': apiKey
    },
    datatype: 'json',
    success: function(data) {
      // console.log(data)

      var characters = data.Response.data.characters
      var grimoire = data.Response.data.grimoireScore

      //$('#summary').text('Grimoire Score: ' + grimoire)
      addStat('Grimoire Score', grimoire)
      var nc = characters.length

      for (var i = 0; i < characters.length; i++) {
        var cid = characters[i].characterBase.characterId
        var desc = characterDscr(characters[i].characterBase)
        getActivities(mid, cid, i, desc, nc)
      }
    },
    error: function(exception) {
      console.log(exception)
    }
  })
}

function addStat (statName, statValue) {
  var gs = document.createElement('div')
  gs.className = 'card'

  var gt = document.createElement('b')
  gt.className = 'card-header'
  gt.innerHTML = statName

  gs.append(gt)

  var score = document.createElement('h2')
  score.align = 'right'
  score.innerHTML = statValue

  var gb = document.createElement('div')
  gb.className = 'card-block'

  gb.append(score)
  gs.append(gb)

  var col = document.createElement('div')
  col.className = 'col-xs-6 col-md-3'
  col.append(gs)
  $('#summary').append(col)
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


    gs.append(gt)


    var score = document.createElement('h2')
    score.align = 'right'
    score.innerHTML = statValue

    var gb = document.createElement('div')
    gb.className = 'card-block'

    gb.append(score)
    gs.append(gb)

    var col = document.createElement('div')
    col.className = 'col-xs-6 col-md-3'
    col.append(gs)
    $('#summary').append(col)
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

    }

    var raceHash = cb.raceHash
    var classHash = cb.classHash
    var genderHash = cb.genderHash
    var light = cb.powerLevel

    var dscr = [light, cd[genderHash], cd[raceHash], cd[classHash]]
    return (dscr.join(' '))
}

function getActivities(mid, cid, desc) {
    var req = bungieStuff + '/Stats/AggregateActivityStats/' + selectedAccountType + '/' + mid + '/' + cid + '/'

    $.ajax({
        url: req,
        headers: {
            'X-API-Key': apiKey
        },
        datatype: 'json',
        success: function(data) {
            // console.log(data)
            var activities = data.Response.data.activities
            var completions = new Array(12).fill(0)
            var timePlayed = new Array(12).fill('0h 0m')
            for (var i = 0; i < activities.length; i++) {
                for (var j = 0; j < raidActivityHash.length; j++) {
                    if (activities[i].activityHash === raidActivityHash[j]) {
                        completions[j] = activities[i].values.activityCompletions.basic.value
                        timePlayed[j] = activities[i].values.activitySecondsPlayed.basic.displayValue
                    }
                }
            }

            tableCreate(completions, timePlayed, desc)
        },
        error: function(err) {
            console.log(err)
        }
    })
}

function deletedgetActivities(mid, cid) {
    var req = bungieStuff + '/Stats/AggregateActivityStats/' + selectedAccountType + '/' + mid + '/' + cid + '/'

    $.ajax({
        url: req,
        headers: {
            'X-API-Key': apiKey
        },
        datatype: 'json',
        success: function(data) {
            // console.log(data)
            var activities = data.Response.data.activities
            var completions = new Array(12).fill(0)
            var timePlayed = new Array(12).fill('0h 0m')
            for (var i = 0; i < activities.length; i++) {
                for (var j = 0; j < raidActivityHash.length; j++) {
                    if (activities[i].activityHash === raidActivityHash[j]) {
                        completions[j] = activities[i].values.activityCompletions.basic.value
                        timePlayed[j] = activities[i].values.activitySecondsPlayed.basic.displayValue
                    }
                }
            }

            deletedtableCreate(completions, timePlayed, "Deleted Character")
        },
        error: function(err) {
            console.log(err)
        }
    })
}

function tableCreate(completions, timePlayed, title) {
    var chCard = document.createElement('div')
    chCard.className = 'card'

    var chSum = document.createElement('h5')
    chSum.className = 'card-header'
    chSum.innerHTML = title

    chCard.appendChild(chSum)

    var tbl = document.createElement('table')
    tbl.className = 'table table-sm table-hover'

    var tr,
    td
    for (var i = 0; i < 12; i++) {
        if (i % 3 === 0) {
            tr = tbl.insertRow()
            tr.className = 'table-info'
            td = tr.insertCell()
            td.colSpan = '3'
            var raidtitle = document.createElement('b')
            raidtitle.innerHTML = raidNames[i / 3]
            td.appendChild(raidtitle)
        }

        tr = tbl.insertRow()

        if (completions[i] === 0) {
            tr.className = 'table-danger'
        }

        td = tr.insertCell()
        td.appendChild(document.createTextNode(raidMod[i % 3]))

        td = tr.insertCell()
        td.appendChild(document.createTextNode(completions[i]))

        td = tr.insertCell()
        td.appendChild(document.createTextNode(timePlayed[i]))
    }
    chCard.appendChild(tbl)

    var chCol = document.createElement('div')
    chCol.className = 'col-xs-12 col-md-6 col-lg-4'
    chCol.append(chCard)
    $('#chstats').append(chCol)
}

function deletedtableCreate(completions, timePlayed, title) {
    var chCard = document.createElement('div')
    chCard.className = 'card'

    var chSum = document.createElement('h5')
    chSum.className = 'card-header'
    chSum.innerHTML = title

    chCard.appendChild(chSum)

    var tbl = document.createElement('table')
    tbl.className = 'table table-sm table-hover'

    var tr,
    td
    for (var i = 0; i < 12; i++) {
        if (i % 3 === 0) {
            tr = tbl.insertRow()
            tr.className = 'table-info'
            td = tr.insertCell()
            td.colSpan = '3'
            var raidtitle = document.createElement('b')
            raidtitle.innerHTML = raidNames[i / 3]
            td.appendChild(raidtitle)
        }

        tr = tbl.insertRow()

        if (completions[i] === 0) {
            tr.className = 'table-danger'
        }

        td = tr.insertCell()
        td.appendChild(document.createTextNode(raidMod[i % 3]))

        td = tr.insertCell()
        td.appendChild(document.createTextNode(completions[i]))

        td = tr.insertCell()
        td.appendChild(document.createTextNode(timePlayed[i]))
    }
    chCard.appendChild(tbl)

    var chCol = document.createElement('div')
    chCol.className = 'col-xs-12 col-md-6 col-lg-4'
    chCol.append(chCard)
    $('#deletedchstats').append(chCol)
}

function summary() {
    $('#usernameform').removeClass('has-danger has-success')
    $('#feedback').text(waitText)
    $('#summary').html('')
    $('#chstats').html('')
    $('#deletedchstats').html('')
    findUser()
}

$(document).ready(function() {
    // console.log('page ready')
    $('#usernameform').submit(function(e) {
        e.preventDefault()
        // console.log('form submit')
        summary()
    })
})

