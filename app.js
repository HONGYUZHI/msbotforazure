var restify = require('restify');
var builder = require('botbuilder');
var requestify = require('requestify'); 

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
console.log('%s | %s', process.env.MICROSOFT_APP_ID, process.env.MICROSOFT_APP_PASSWORD); 
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());





//對話cdoe
bot.dialog('/', function (session) {
	var openDoorFlag = session.message.text.indexOf("開門");//確認是否有說出關鍵字熱
    var closeDoorFlag = session.message.text.indexOf("關門");//確認是否有說出關鍵字冷
	
	if(openDoorFlag == -1 && closeDoorFlag == -1){
		session.send("老大，好久不見/n我可以幫你開門");
	}else if(openDoorFlag != -1 && closeDoorFlag == -1) {
		opendoor(0);
		//session.send("老大! 門關了");
	}else if(openDoorFlag != -1 && closeDoorFlag == -1) {
		opendoor(1);
		//session.send("老大! 門開了");
	}else {
		session.send("抱歉我不知道你想說什麼");
	}


});

function opendoor(door_open){
	if(door_open == 1){
		requestify.get('bandgg.ddns.net:1888/DoorOpen', { 
    		params: {
      			door_flag: 1
    		}
		}).then(function(response) {
      		session.send("老大! 門開了");
  		});
	} else {
		requestify.get('bandgg.ddns.net:1888/DoorOpen', { 
    		params: {
      			door_flag: 0
    		}
		}).then(function(response) {
      		session.send("老大! 門關了");
  		});
	}
	
}


function Invokpostdata(open_home,open_room,Airconditioning,temperature)
{
	requestify.request('https://smartdoor-88b17.firebaseio.com/users.json', {
	    method: 'POST',
	    body: {
	        open_home: open_home,
	        open_room: open_room,
	        open_Airconditioning: Airconditioning,
	        temperature:temperature
	    },
	    headers: {
	        'X-Forwarded-By': 'me'
	    },
	    cookies: {
	        mySession: 'some cookie value'
	    },
	    auth: {
	        // username: 'foo',
	        // password: 'bar'
	    },
	    dataType: 'json'        
	})
	.then(function(response) {
	    // get the response body
	    response.getBody();

	    // get the response headers
	    response.getHeaders();

	    // get specific response header
	    response.getHeader('Accept');

	    // get the code
	    response.getCode();

	    // Get the response raw body
	    response.body;
	});
}


