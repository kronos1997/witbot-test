var Botkit = require('botkit');
var Witbot = require('witbot');

var slackToken = "xoxb-41185367776-EBhJdJnL1rcMJiTlEyamFGOa";
var witToken = "XI6IUPF22WQ2777Q65L7HVLCAPZKSVQG";
var openWeatherApiKey = "997684052093606682f0251a37e1d126";

var wit;

var controller = Botkit.slackbot({
    debug: false
});

controller.spawn({
    token: slackToken
}).startRTM(function (err, bot, payload){
    if(err){
        throw new Error('Error connecting to slack: ', err)
    }
    console.log('Connected to slack');
});

var witbot = Witbot(witToken);

var weather = require('./weather')(openWeatherApiKey)

controller.hears('.*', 'direct_message,direct_mention', function(bot, message){
    wit = witbot.process(message.text, bot, message);
    
    wit.hears('default_intent', null, function (bot,message, outcome){
        
        if(outcome.entities.hasOwnProperty('weatherintent')){
            if(outcome.entities.weatherintent[0].value === "weather"){
                if(!outcome.entities.location || outcome.entities.location.length === 0){
                bot.reply(message, 'i\'d love to give you the weather but for where?')
                return
                }
                var location = outcome.entities.location[0].value
                weather.get(location, function(error, msg){
                    if(error){
                        console.error(error)
                        bot.reply(message, "uh oh, there was a problem getting the weather")
                        return
                    }
                    bot.reply(message, msg)
                })
            }
        }else{
            bot.reply(message, 'Greetings! Try asking about the weather.')
        }
    })

//  wit.otherwise(function (bot, message) {
//    bot.reply(message, 'You are so intelligent, and I am so simple. I don\'t understnd')
//  })
});

