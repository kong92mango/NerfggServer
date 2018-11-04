const express = require('express');
const bodyParser = require('body-parser');
const { Kayn, REGIONS } = require('kayn')
const apiKey = 'RGAPI-7e0de7f0-b5f6-4e07-86cb-004b85b07baf'
const kayn = Kayn(apiKey)(/*{
    region: REGIONS.NORTH_AMERICA,
    locale: 'en_US',
    debugOptions: {
        isEnabled: true,
        showKey: false,
    },
    requestOptions: {
        shouldRetry: true,
        numberOfRetriesBeforeAbort: 3,
        delayBeforeRetry: 1000,
        burst: false,
        shouldExitOn403: false,
    },
    cacheOptions: {
        cache: null,
        timeToLives: {
            useDefault: false,
            byGroup: {},
            byMethod: {},
        },
    },
}*/)
const app = express();
const cors = require('cors');
// app.use(express.static(path.join(__dirname, 'build')));

var lolapi = require("league-api-2.0");
lolapi.base.setKey(apiKey);
lolapi.base.setBaseURL(".api.riotgames.com");
lolapi.base.setRegion("na1");
lolapi.base.setRateLimit(20);

app.use(bodyParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.post('/dataRoute', function (req, res) {
  const getFullMatches = async() => {
    const summonerName = req.body.summonerName;
    const summonerStats = await kayn.Summoner.by.name(summonerName);
    const summonerMatches = await kayn.Matchlist.by.accountID(summonerStats.accountId);
    const recentMatchIds = [];
    for (var i = 0; i < 5; i++){
      recentMatchIds.push(summonerMatches.matches[i].gameId);
    }
    const recentMatchDetails = [];
    for (var matchId in recentMatchIds) {
      var matchDetail = await lolapi.executeCall("Match","getMatchByMatchId", recentMatchIds[matchId]);
      recentMatchDetails.push(matchDetail);
    }
    return recentMatchDetails;
  }
  getFullMatches()
  .then(result => {
    return res.send(result);
  })
});

app.listen(process.env.PORT || 80);
