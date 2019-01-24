# LobbyQuiz

Lobby Quiz is an entry into the [2018 Riot Games API Challenge](https://www.riotgames.com/en/DevRel/the-riot-games-api-challenge-2018) from Asurax96. Lobby Quiz consists of two repositories: the [backend](https://github.com/ASchwad/LobbyQuiz-Server) and the [frontend](https://github.com/ASchwad/LobbyQuiz-Client).  

Lobby Quiz lets you compare your performance with your friends and discover individual strengths and weaknesses. This quiz is not only 
entertaining while waiting for your last lobby member, it is also encouraging to improve your Key Performance Indicators (KPIs) like 
your Vision Score or your Creep Score. Based on these KPIs you can discuss as a team about which strategy to pick.

Check this video for a quick demo.   
[![](https://res.cloudinary.com/docguta73/image/upload/v1548291972/video_shot_dkv8gb.png)](https://youtu.be/QaXd3-j3tyM)


Which League Client API are you using?
* lol-lobby 
* lol-career-stats


## Setup
1. clone the repo with `git clone https://github.com/ASchwad/LobbyQuiz-Server.git`
2. go into the directory via cmd, install the project with `npm install` and run `npm start`
3. follow steps 1 and 2 for the client repo `https://github.com/ASchwad/LobbyQuiz-Client.git`
4. Open League of Legends, create a Lobby and invite your mates
5. Start the quiz

### Process flow
1. Get Client Credentials with [LCU Connector](https://github.com/Pupix/lcu-connector)
2. Get Players in Lobby with **lol-lobby endpoint**
3. Get Stats of players with **lol-career-stats endpoint**
4. Calculate KPIs with Stats

### Development & Challenges:
I experimented earlier with the Riot-API, but I had no clue about the Client API. Thanks to Pupix's Rift Explorer I understood the 
possibilities and limitations. I started out trying around with plain HTML and Javascript but quickly realized that i should separate Logic from Presentation.
Specially CORS and Certification errors haunted me at that time. So I rethought my architecture and my requirements.

#### Requirements:
* Use of React.js, since i will need it for another project soon
* Compare stats from lobby members for different queues
* Gamify the comparison and make it a Quiz

#### Dataflow and Architecture
![Lobby Quiz IT Architecture](https://res.cloudinary.com/docguta73/image/upload/v1548284815/Lobby_Quiz_Dataflow_bex6ea.png)   
The entry version has a one-directional data flow. The LobbyQuiz-Server extracts the necessary data from the League Client and prepares them for the Lobby-Quiz-Client,
which presents the data to the user.

#### Challenges
* API    
In Node.js I started out to have every process step as own request. But I did not see an advantage in having the user click more buttons before he can actually play. For the quiz use case, i wanted to have a summary function which does all the querys in the background and responds with the finished quiz object. 
* async <-> sync   
Therefore a bigger challenge for me to solve, was to fetch multiple API calls after each other within the synchronous Javascript. Challenged by this, i finally learned more about the usage of Promises and async code. I have spent several days in Callback hell...   
* Testing    
Testing is / was not easy since this app is depending
on other players in the lobby. In the beginning i was simulating the data, but luckily afterwards I just had constantly some afk mates sitting in my lobby.
* Endpoint issues   
Another issue was the endpoint. `GET /lol-career-stats/v1/summoner-stats/{puuid}/{season}/{queue}/{position}` is the endpoint i used.
No matter which position is chosen, the response contains a queueSummary with the various stats properties of the specific player. This queueSummary is 
used for the quiz. The problem is, that a lane has to be chosen. If the player did not play a game in the chosen queue at the chosen position, this will return an error.
Unfortunately i did not find a solution so far. For now this Quiz only works for solo / duo Queue for people who have more than 1 game as ADC in Season 8.     
Before I decided to do a code freeze for the challenge entry, i was working on enabling the configuration of the query. This could have a big benefit in the
practicability of the LobbyQuiz, since more people could use it. Nevertheless, this led to too many complications and must be dealt with after the entry.
* react.js   
After setting up the data model of `players` and `quiz` in LobbyQuiz-Server and the preparation of the KPIs, i was finally ready to learn react.js.
With this project i wanted to dive into react, but I still feel like i only got my feet wet and scratched the surface of react (not even talking of redux).
But still it was great to get an idea about this technology. 


## Future Plans
* Team Scores  
One thing that only came up on my mind within the last days are the team scores. For example the average vison score per game in the lobby.
Higher averages of such KPIs indicate a higher skill level and better chance to win. This could encourage lobbys to improve and to level up their game based on KPIs.
The players could even synergize their picking comp based on their KPI strengths.
* Configuration  
As said above, further configuration possibilities should be possible for the user. e.g. to change the Queue
* Summary  
Get an overview over all questions and stats. 
* Chat  
To make it an interactive quiz, the app could access the lobby chat and post questions and results. Players guesses could be also taken that way.
* More questions  
More questions could be generated. Specially with the regular riot-api, very specific questions could be asked. I am dreaming of 
questions like "Who surrendered the most?" or "Who has slain the most Teemos?"
* Styling & Design  
* Error Handling & Code Quality  

## Conclusion
Two of the three requirements have been fulfilled. In my opinion the Lobby Quiz currently lacks the Gamification component, since no answers can be chosen 
nor can any points be won. Nevertheless the proof of concept is done and as a quizmaster, you can still quiz your mates and take their guesses.
I was hoping to get the frontend prettier, but in the given time for this entry I am happy with the result and learnt a lot. 

## Special Thanks
Thanks to everybody who read all this! Thanks to the Riot API Team and Riot Management to make this API tinkering possible. Everybody wins at the end of this challenge! Special thanks also to Pupix for the Rift Explorer and the LCU Connector.
