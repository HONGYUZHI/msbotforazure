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
    appId: "",
    appPassword: ""
});
console.log('%s | %s', process.env.MICROSOFT_APP_ID, process.env.MICROSOFT_APP_PASSWORD); 
var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

// bot.dialog('/', function (session) {
//     session.send("Hello World");
// });

// Create your bot with a function to receive messages from the u
// Listen for messages from users 


//對話cdoe
var bot = new builder.UniversalBot(connector, function (session) {



	var notTag = session.message.text.indexOf("不");
	var feelHot = session.message.text.indexOf("熱");//確認是否有說出關鍵字熱
    var feelCool = session.message.text.indexOf("冷");//確認是否有說出關鍵字冷
	
	if(feelHot == -1 && feelCool == -1 || notTag >= 0){
		session.send("你好，房間有什麼問題可以跟我說");
	}else if(feelHot != -1 && feelCool == -1) {
		session.send("我去調低溫度");
		Invokpostdata(0,0,1,25);
	}else if(feelCool != -1 && feelHot == -1) {
		session.send("我去調高溫度");
		Invokpostdata(0,0,1,30);
	}else {
		session.send("抱歉我不知道你想說什麼");
	}


});



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


