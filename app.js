var async = require("async");
const request = require('request');
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(bodyParser.json());

//for now static
var queue = "rank5solo";


app.use((req, res, next) => {
    // How is allowed to access? --> Can be overwritten still
    res.header('Access-Control-Allow-Origin', '*');
    // Which Headers are allowed?
    res.header('Access-Control-Allow-Headers', 'authorization');
    // Browser checks with OPTIONS if he can actually act methods on the target
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, POST, DELETE');
        return res.status(200).json({});
    };
    next();
});

app.get('/getCredentials', function (req, res){
    getCredentials().then(data => {
        res.status(200).json({
            data: data
        });
    });        
});

const getCredentials= () => {
        return new Promise((resolve, reject) => {
            const LCUConnector = require('lcu-connector');
            const connector = new LCUConnector();

            connector.on('connect', (data) => {
            var input = new Buffer('riot:' + data.password);
            var inputEncoded = input.toString('base64');
            var token = 'Basic ' + inputEncoded;

            resolve({token: token, port: data.port})
        });
        // Start listening for the LCU client
        connector.start();  
    });
}

const getLobby = (port, token, namesRequired) => {
    return new Promise((resolve, reject) => {
        var options = {
            method: "GET",
            "rejectUnauthorized": false,
            "url": "https://127.0.0.1:" + port + "/lol-lobby/v2/lobby",
            "headers": {'Authorization': token, 'Accept': 'application/json'}
        };
        
        function callback(error, response, body){
           if (!error && response.statusCode == 200) {
               // Parse Body in Json to do mapping
                var responseBody = JSON.parse(response.body);
                var names = responseBody.members.map(x => x.summonerName);
                var puuids = responseBody.members.map(x => x.puuid);
                if(namesRequired){
                    resolve(names);
                }
                resolve(puuids);
            }else{
                console.log(error);
            }
        }
        request(options, callback);
    });
}

app.get('/getPlayers', function (req, res) {
    getLobby(req.body.port, req.body.token).then(data => {
        res.status(200).json({
            data: data
        });
    });    
 });

 app.get('/getStats', function (req, res) {
    getStats(req.body.port, req.body.token, req.body.puuid).then(data => {
        res.status(200).json({
            data: data
        });
    });    
 });


function getStats(port, token, puuid){
    return new Promise((resolve, reject) => {
        var options = {
            method: "GET",
            "rejectUnauthorized": false,
            "url": "https://127.0.0.1:" + port + "/lol-career-stats/v1/summoner-stats/" + puuid + "/8/" + queue + "/BOTTOM",
            "headers": {'Authorization': token, 'Accept': 'application/json'}
        };
    
        function returnData(error, response){    
            
            if (!error && response.statusCode == 200) {
                var responseBody =  JSON.parse(response.body);
                var stats = responseBody.seasonSummary[8][queue].queueSummary.stats["CareerStats.js"];
           
                resolve(stats);                
            }else{
                console.log(error);
            }
        }
        request(options, returnData);
    })
    
 };

 app.get('/playQuiz', function (req, res) {
    playQuiz().then(data => {
        res.status(200).json({
            quiz: data
        });
    });    
 });

async function playQuiz(){
    var players = {
        summonerNames: [],
        puuids: [],
        stats: []
    }
    try{
        credentials = await getCredentials();
    }catch(e){
        return "Try opening the League Client"
    }
   
   
   token = credentials.token;
   port = credentials.port;

   players.summonerNames = await getLobby(port, token, true);
   players.puuids = await getLobby(port, token, false);
   console.log(players);
   for(i=0; i<players.puuids.length; i++){
        players.stats[i] = await getStats(port, token, players.puuids[i])
   }
   return evaluateQuiz(players);
}

function evaluateQuiz(players){
        var quiz = {
            participants: players.summonerNames,
            questions: 
        [
            {
                questionId: 1,
                question: "Who has the most cs per game?",
                results: [],
                kpi: "Creep Score per Game"
            },
            {
                questionId: 2,
                question: "Who has the highest vision score per game?",
                results: [],
                kpi: "Vision Score per Game"
            },
            {
                questionId: 3,
                question: "Who has the best win rate? (In %)",
                results: [],
                kpi: "Winrate in %"
            },
            {
                questionId: 4,
                question: "Who has the most triple kills?",
                results: [],
                kpi: "Triple Kills"
            },
            {
                questionId: 5,
                question: "Who has the highest objective participation?",
                results: [],
                kpi: "Objectives per Game"
            },
            {
                questionId: 6,
                question: "Who has the highest K/D/A?",
                results: [],
                kpi: "KDA"
            }]};
        
        for(var i=0; i<players.puuids.length; i++){
            
            quiz.questions[0].results.push((players.stats[i].csScore / players.stats[i].gamePlayed).toFixed(2));

            quiz.questions[1].results.push((players.stats[i].visionScore / players.stats[i].gamePlayed).toFixed(2));
    
            quiz.questions[2].results.push((players.stats[i].victory / players.stats[i].gamePlayed * 100).toFixed(2));

            quiz.questions[3].results.push(players.stats[i].tripleKills);

            quiz.questions[4].results.push((players.stats[i].objectiveTakenInvolved / players.stats[i].gamePlayed).toFixed(2));

            quiz.questions[5].results.push(((players.stats[i].assists + players.stats[i].kills) / players.stats[i].deaths).toFixed(2));
        }
        //console.log(quiz);
        return quiz;
};
    
app.use((req, res, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    // forwards the error response
    next(error);
});

// any other operational Error like DB errors
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;