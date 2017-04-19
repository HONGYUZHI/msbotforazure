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
	var openDoorFlag = session.message.text.indexOf("開門");
	var closeDoorFlag = session.message.text.indexOf("關門");
	var engineLaunchFlag = session.message.text.indexOf("發動引擎");
	var engineUnLaunchFlag = session.message.text.indexOf("熄火");
	
	
	if(openDoorFlag == -1 && closeDoorFlag == -1 && engineLaunchFlag == -1 && engineUnLaunchFlag == -1 ){
		session.send("老大，好久不見  我可以幫你開門 和 發動引擎");
	}else if(closeDoorFlag != -1 && openDoorFlag == -1) {
		opendoor(0);
		session.send("老大! 門關了");
	}else if(openDoorFlag != -1 && closeDoorFlag == -1) {
		opendoor(1);
		session.send("老大! 門開了");
		
	}else if(engineLaunchFlag != -1 && engineUnLaunchFlag == -1) {
		session.beginDialog('/engine');
	}else if(engineLaunchFlag == -1 && engineUnLaunchFlag != -1) {
		session.beginDialog('/stopEngine');
	}else {
		session.send("抱歉我不知道你想說什麼");
	}
});

bot.dialog('/engine', [function (session) {
		builder.Prompts.text(session, '老大! 你確定要發動引擎嗎?');
	},
	function(session, result) {
		var yesFlag = result.response.indexOf("是");
		var noFlag = result.response.indexOf("不是") ;
		if(yesFlag == 0 && noFlag == -1){
			session.send("車子發動了");
			engineLaunch(1);
			session.endDialog();
		} else if(yesFlag == 1 && noFlag == 0) {
			session.send("老大，好久不見  我可以幫你開門 和 發動引擎");
			session.endDialog();
		} else {
			session.send("請回答 是 或 不是");
			session.beginDialog('/engine');
		}
	}]
);

bot.dialog('/stopEngine', [function (session) {
		builder.Prompts.text(session, '老大! 你確定熄火嗎?');
	},
	function(session, result) {
		var yesFlag = result.response.indexOf("是");
		var noFlag = result.response.indexOf("不是") ;
		if(yesFlag == 0 && noFlag == -1){
			session.send("車子熄火了");
			engineLaunch(0);
			session.endDialog();
		} else if(yesFlag == 1 && noFlag == 0) {
			session.send("老大，好久不見  我可以幫你開門 和 發動引擎");
			session.endDialog();
		} else {
			session.send("請回答 是 或 不是");
			session.beginDialog('/stopEngine');
		}
	}]
);

function opendoor(door_open){
	if(door_open == 1){
		requestify.get('http://bandgg.ddns.net:1888/DoorOpen?door_flag=1');
	} else {
		requestify.get('http://bandgg.ddns.net:1888/DoorOpen?door_flag=0');
	}
}

function engineLaunch(engine){
	if(engine == 1){
		requestify.get('http://bandgg.ddns.net:1888/EngineLaunch?engine_flag=1');
	} else {
		requestify.get('http://bandgg.ddns.net:1888/EngineLaunch?engine_flag=0');
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


