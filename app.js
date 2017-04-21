var restify = require('restify');
var builder = require('botbuilder');
var requestify = require('requestify'); 
var http = require('http');
var intents = new builder.IntentDialog();
//FCM
var FCM = require('fcm-node');
//FCM Server Key
var serverKey = "AAAAE09BZ9U:APA91bFoyZ8QTK4EHzWbtEn-fLvQ1sYIvNMCR1vfxvrO03FzcX0unwJm65Z-UTfbtN-S8BqLFPbRP61huQbuIaIYlaxS7VNmLm7pJZuhJkxyWLUbI0CnYPv2oHTxD3ctMr4_TyLyzs6T" 
var fcm = new FCM(serverKey);
//const DEVICE_TOKEN = 'fywLwGXTpCs:APA91bGwFK8bf3WbV4FH-vGd1oGPZ113vZYba4Mutm1b3F-BklCEtOChXyTsC8f1v-AxJU-7yP64USG2MBn2RXFs1RYl3yxSb71A3nORxkzmXA_JpKnmeLaFzzgC9NgLSyQAcnWKPd-5';

const DEVICE_TOKEN = 'dSiNsmzCBFA:APA91bEzX92MDdQEnuSI_P4Ik32lRSyhYqa1bGFTFdCZrE8wKKD1VW2LuSRB-nUay25EV6fwUNNM0u_iq5ez2mpSjXmBSwqoefSc6ntYHv3HwMPg0I1qcFpSV-keXyEvkoBQiZDOhgh9';


var localhostserver='http://192.168.43.106:1888';
//http://192.168.43.106:1888/DoorOpen?door_flag=0
//=========================================================
// Bot Setup
//=========================================================


// const SERVER_HOST = 'http://localhost';
const SERVER_HOST = 'http://bandgg.ddns.net:1888';



// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
  resp.on('data', function(ip) {
    console.log("My public IP address is: " + ip);
  });
});
   
//Create chat bot
var connector = new builder.ChatConnector({
    appId: '285ad161-2218-40a7-91d8-8d47a3941bf1',
    appPassword: 'YV7kCQ5fraiQ0DqAZQNHV7G'
});

// var connector = new builder.ChatConnector({
//     appId: process.env.MICROSOFT_APP_ID,
//     appPassword: process.env.MICROSOFT_APP_PASSWORD
// });

console.log('%s | %s', process.env.MICROSOFT_APP_ID, process.env.MICROSOFT_APP_PASSWORD); 

var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());


server.get("/carAutoStatus", function(req, res) {

	var resObj = {status:'success'};
	res.send(resObj);
});


var registSession;




bot.dialog('/', intents);


intents.onDefault(function(session) {
	session.send("老大! 初次見面，可鍵入\"功能\"查看完整項目， 開發人員指令可使用\"網路設定\"");
});

intents.matches(/^功能/i, function(session) {
	session.send("開門/關門/發動車子/熄火/開啟自動駕駛/關閉自動駕駛/來接我/");
});


intents.matches(/^開門/i, function(session) {
	opendoor(1);
	session.send("老大! 門開了");
	registSession = session;
});

intents.matches(/^關門/i, function(session) {
	opendoor(0);
	session.send("老大! 門關了");
});

intents.matches(/^發動車子/i, function(session) {
	engineLaunch(1);
	session.send("車子發動了");
});

intents.matches(/^熄火/i, function(session) { //熄火這件事情需要審慎考慮
	session.beginDialog('/stopEngine');
});

intents.matches(/^開啟自動駕駛/i, function(session) {
	session.send("老大! 開始出發嚕！");
	startAutoDrive(1);
});

intents.matches(/^關閉自動駕駛/i, function(session) {
	session.send("老大! 已經改為手動駕駛 請注意安全！");
	startAutoDrive(0);
});

intents.matches(/^來接我/i, [
	function(session) {
		builder.Prompts.text(session, '你在哪邊?');
	},
	function(session, result) {
		sendFCM(DEVICE_TOKEN, localhostserver, localhostserver + '/setAutoDriveDest?destination=' + result.response);
		engineLaunch(1);
		startAutoDrive(1);
		session.send("我正在過去! 需要我順便帶消夜過去嗎? 開完笑的 呵呵!");
	}
]);


bot.dialog('/stopEngine', [function (session) {
		builder.Prompts.text(session, '老大! 你確定熄火嗎?');
	},
	function(session, result) {
		var yesFlag = result.response.indexOf("是");
		var noFlag = result.response.indexOf("不是") ;
		if(yesFlag == 0 && noFlag == -1){
			session.send("車子熄火了");
			engineLaunch(0);
			// sendFCM(DEVICE_TOKEN, localhostserver, localhostserver+'/EngineLaunch?engine_flag=0');
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




//////

function opendoor(door_open){
	if(door_open == 1){
		makeRequest('/DoorOpen?door_flag=1');
		// sendFCM(DEVICE_TOKEN, localhostserver, localhostserver+'/DoorOpen?door_flag=1');
		// requestify.get(SERVER_HOST + '/DoorOpen?door_flag=1');
	} else {
		makeRequest('/DoorOpen?door_flag=0');
		// sendFCM(DEVICE_TOKEN, localhostserver, localhostserver+'/DoorOpen?door_flag=0');
		// requestify.get(SERVER_HOST + '/DoorOpen?door_flag=0');
	}
}

function engineLaunch(engine){
	if(engine == 1){
		makeRequest('/EngineLaunch?engine_flag=1');
		// sendFCM(DEVICE_TOKEN, localhostserver, localhostserver+'/EngineLaunch?engine_flag=1');
		// requestify.get(SERVER_HOST + '/EngineLaunch?engine_flag=1');
	} else {
		makeRequest('/EngineLaunch?engine_flag=0');
		// sendFCM(DEVICE_TOKEN, localhostserver, localhostserver+'/EngineLaunch?engine_flag=0');
		// requestify.get(SERVER_HOST + '/EngineLaunch?engine_flag=0');
	}
}


function startAutoDrive(flag) {
	if(flag == 1) {
		makeRequest('auto_flag1');
		// sendFCM(DEVICE_TOKEN, localhostserver, localhostserver+'auto_flag1');
	} else {
		makeRequest('auto_flag0');
		// sendFCM(DEVICE_TOKEN, localhostserver, localhostserver+'auto_flag0');
	}
}

function checkDestination(destination) {

}


function contains(fullString, containsStr) {
	if(fullString.indexOf(containsStr) != -1) {
		return true;
	}
	return false;
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


var fcmWork = true;

//
//Url相關
//
function sendFCM(deviceToken, fcmCommand, msg) {

    "use strict";

    var message = {
        to: deviceToken,
        notification: {
            title: 'Inteligent Car',
            body: 'This is an Ineligent command'
        },
        data: {
            command: fcmCommand,
            value: msg
        }
    }

    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });

}

function sendUrlRequest(requestString) {
	requestify.get(SERVER_HOST + requestString);
}


function makeRequest(requestString) {
	if(fcmWork) {
		sendFCM(DEVICE_TOKEN, localhostserver, localhostserver + requestString);
	} else {
		sendUrlRequest(requestString);
		
	}
}



//
//開發人員指令
//
intents.matches(/^網路設定/i, [
	function(session) {
		builder.Prompts.text(session, '是否開啟FCM?');
	},
	function(session, result) {
		var yesFlag = result.response.indexOf("是");
		var noFlag = result.response.indexOf("不是") ;
		if(contains(result.response, "是")) {
			fcmWork = true;
			session.send("使用FCM傳輸");
		} else {
			fcmWork = false;
			session.send("網域傳輸");
		}

	}
]);

