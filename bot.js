var admincmds = require('./commands/admincmds.js');
var coincmds = require('./commands/coincmds.js');
var casino = require('./commands/gamble.js')
var broadcast = require('./commands/broadcasts.js')
var account = require('./account.js');

var Discord = require('discord.io');
var tmi = require('tmi.js')
var loki = require('lokijs')

//##################################################################################################################
//################################################### TWITCH BOT ###################################################
//##################################################################################################################
var greet = false;
var channel = account.channel;
var options = {
  options: {
    debug: false
  },
  connection: {
    reconnect: true,
    port: 80
  },
  identity: {
    username: account.nick,
    password: account.pw
  },
  channels: [channel]
}

var client = new tmi.client(options);
var db = new loki('./database.db',
      {
        autoload: true,
        autoloadCallback : loadHandler,
        autosave: true,
        autosaveInterval: 1000
      });
var users = null;
var commands = null;
var lottery = null;
var broadcasts = null;
function loadHandler() {
    users = db.getCollection('users');
    commands = db.getCollection('commands');
    lottery = db.getCollection('lottery');
    broadcasts = db.getCollection('broadcasts');
    if (!users) {
        users = db.addCollection('users');
    }
    if (!commands) {
      commands = db.addCollection('commands');
    }
    if (!lottery) {
      lottery = db.addCollection('lottery');
    }
    if (!broadcasts) {
      broadcasts = db.addCollection('broadcasts');
    }
}
var timer = 0
setInterval(interval, (1000))
function interval() {
  if(timer % 60 == 0){
    coincmds.giveCoins(channel, users, account.twitchID)
  }
  broadcast.playbrd('twitch', client, broadcasts, channel, timer);
  db.saveDatabase();
  timer++;
}
client.connect();
console.log('*****TWITCHBOT ONLINE*****')

//################################################### TWITCH CHAT ###################################################
client.on("chat", (channel, userstate, message, self) => {
  console.log('<TWITCH> ' + userstate.username + ': ' + message)
  if(self){
    return
  }
  coincmds.knowUser(users, userstate.username)

  //MOD FUNCTIONS
  if(userstate.mod){
    if (message.includes('!addcmd')){
      admincmds.addcmd('twitch', client, commands, channel, message);
      return;
    //EDITCMD
    }else if(message.includes('!editcmd')){
      admincmds.editcmd('twitch', client, commands, channel, message);
      return;
    //DELCMD
    }else if(message.includes('!delcmd')){
      admincmds.delcmd('twitch', client, commands, channel, message);
      return;
    //GREET
    }else if(message.includes('!greet')){
      greet = admincmds.greet(client, greet, channel);
      return;
    }else if(message.includes('!hidediscord')){
        admincmds.hidediscord('twitch', client, commands, channel, message);
    }else if(message.includes('!hidetwitch')){
        admincmds.hidetwitch('twitch', client, commands, channel, message);
    }else if(message.toLowerCase().includes('!addbrd')){
      broadcast.addbrd('twitch', client, broadcasts, channel, message);
    }else if(message.toLowerCase().includes('delbrd')){
      broadcast.delbrd('twitch', client, broadcasts, channel, message);
    }else if(message.toLowerCase().includes('listbrd')){
      broadcast.listbrd('twitch', client, broadcasts, channel);
    }else if(message.toLowerCase().includes('pausebrd') && !message.toLowerCase().includes('unpause')){
      broadcast.pausebrd('twitch', client, broadcasts, channel, message);
    }else if(message.toLowerCase().includes('unpausebrd')){
      broadcast.unpausebrd('twitch', client, broadcasts, channel, message);
    }else if(message.includes('!startLottery')){
      coincmds.startLottery(client, message, lottery, channel);
    }else if(message.includes('!endLottery')){
      coincmds.endLottery(client, lottery, channel);
    }else if(message.includes('!cancelLottery')){
      coincmds.cancelLottery(client, users, lottery, channel);
    }
  }


  //LIST COMMANDS
  if(message.toLowerCase() ==  '!commands'){
    var cmds = commands.where(function(obj) {
      if(!obj.hidetwitch)
        return true;
      return false;
    });
    msg = ''
    for(i=0;i<cmds.length;i++){
      msg += cmds[i].command
      if(i != cmds.length -1){
        msg += ', '
      }
    }
    client.say(channel, msg)
  }

  //COINS FUNCTIONS
  //VIEW COINS
  if(message.includes("!coins") || message.includes("!chips")){
    coincmds.viewCoins(client, users, channel, userstate);
  //GAMBLE
  }else if(message.includes("!gamble")){
    casino.gamble(client, users, channel, userstate, message);
  //SEND COINS
  }else if(message.includes('!send')){
    coincmds.send(client, users, channel, userstate, message);
  //ZWIEBELTOPF
  }else if(message.toLowerCase().includes('!zwiebeltopf')){
    coincmds.participateLottery(client, users, channel, userstate, message, lottery);
  }else if(message.toLowerCase().includes('!chance')){
    coincmds.showLotteryStats(client, users, channel, userstate, message, lottery);
  }

  //CUSTOM COMMANDS
  msg = message.split(" ")
  if(msg.length == 1 && commands.findOne({ command:msg[0].toLowerCase()})){
    client.say(channel, commands.findOne({ command:msg[0].toLowerCase()}).response)
  }
});

//################################################### TWITCH WHISPER ###################################################
var twitchmods = ['#pokerzwiebel', '#onlyamiga', '#dukexentis'];
client.on("whisper", function (from, userstate, message, self) {
    if (self) return;
    console.log('<TWITCH WHISPER> ' + from + ': ' + message);
    if(twitchmods.includes(from)){
      if (message.includes('!addcmd')){
        admincmds.addcmd('twitchwhisper', client, commands, from, message);
        return;
      //EDITCMD
      }else if(message.includes('!editcmd')){
        admincmds.editcmd('twitchwhisper', client, commands, from, message);
        return;
      //DELCMD
      }else if(message.includes('!delcmd')){
        admincmds.delcmd('twitchwhisper', client, commands, from, message);
        return;
      //HIDE
      }else if(message.includes('!hidediscord') && admins.includes(userID)){
        admincmds.hidediscord('twitchwhisper', client, commands, from, message);
      }else if(message.includes('!hidetwitch') && admins.includes(userID)){
        admincmds.hidetwitch('twitchwhisper', client, commands, from, message);
      //BROADCASTS
      }else if(message.toLowerCase().includes('!addbrd')){
        broadcast.addbrd('twitchwhisper', client, broadcasts, from, message);
      }else if(message.toLowerCase().includes('delbrd')){
        broadcast.delbrd('twitchwhisper', client, broadcasts, from, message);
      }else if(message.toLowerCase().includes('listbrd')){
        broadcast.listbrd('twitchwhisper', client, broadcasts, from);
      }else if(message.toLowerCase().includes('pausebrd') && !message.toLowerCase().includes('unpause')){
        broadcast.pausebrd('twitchwhisper', client, broadcasts, from, message);
      }else if(message.toLowerCase().includes('unpausebrd')){
        broadcast.unpausebrd('twitchwhisper', client, broadcasts, from, message);
      }
    }

    msg = message.split(" ")
    if(msg.length == 1 && commands.findOne({ command:msg[0].toLowerCase()})){
      client.whisper( from, commands.findOne({ command:msg[0].toLowerCase()}).response)
    }

    //LIST COMMANDS
    if(message  ===  '!commands'){
      var cmds = commands.where(function(obj) {
        if(!obj.hidediscord)
          return true;
        return false;
      });
      msg = ''
      for(i=0;i<cmds.length;i++){
        msg += cmds[i].command
        if(i != cmds.length -1){
          msg += ', '
        }
      }
      client.whisper(from, msg)
    }
});

//################################################### TWITCH GREETING ###################################################
client.on("join", function (self, username) {
  if(users.findOne({ name:username }) == null){
    if(greet && username != "zwiebeibot"){
      client.say(channel, "Willkommen im Zwiebelstream, " + username + "!");
    }
    users.insert({
      name: username,
      coins: 0
    });
  }else if(username != 'pokerzwiebel'){
    if(greet && username != "zwiebeibot"){
      client.say(channel, "Willkommen zurück im Zwiebelstream, " + username + "! ");
    }
  }
});


//###################################################################################################################
//################################################### DISCORD BOT ###################################################
//###################################################################################################################
var admins = ['306705915162263562', '238670889397256193', '248185632768262145']
var bot = new Discord.Client({
    token: account.token,
    autorun: true
});

bot.on('ready', function() {
    console.log('*****DISCORDBOT ONLINE*****');
});

bot.on('message', function(user, userID, channelID, message, event) {
  console.log('<DISCORD> ' + user +': ' + message)

  //ADMINCOMMANDS
  if(admins.includes(userID)){
    if (message.includes('!addcmd')){
      admincmds.addcmd('discord', bot, commands, channelID, message);
      return;
    //EDITCMD
    }else if(message.includes('!editcmd')){
      admincmds.editcmd('discord', bot, commands, channelID, message);
      return;
    //DELCMD
    }else if(message.includes('!delcmd')){
      admincmds.delcmd('discord', bot, commands, channelID, message);
      return;
    //HIDE
    }else if(message.includes('!hidediscord') && admins.includes(userID)){
      admincmds.hidediscord('discord', bot, commands, channelID, message);
    }else if(message.includes('!hidetwitch') && admins.includes(userID)){
      admincmds.hidetwitch('discord', bot, commands, channelID, message);
    //BROADCASTS
    }else if(message.toLowerCase().includes('!addbrd')){
      broadcast.addbrd('discord', bot, broadcasts, channelID, message);
    }else if(message.toLowerCase().includes('delbrd')){
      broadcast.delbrd('discord', bot, broadcasts, channelID, message);
    }else if(message.toLowerCase().includes('listbrd')){
      broadcast.listbrd('discord', bot, broadcasts, channelID);
    }else if(message.toLowerCase().includes('pausebrd') && !message.toLowerCase().includes('unpause')){
      broadcast.pausebrd('discord', bot, broadcasts, channelID, message);
    }else if(message.toLowerCase().includes('unpausebrd')){
      broadcast.unpausebrd('discord', bot, broadcasts, channelID, message);
    }
  }

  //CUSTOM COMMANDS
  msg = message.split(" ")
  if(msg.length == 1 && commands.findOne({ command:msg[0].toLowerCase()})){
    bot.sendMessage({ to:channelID, message:commands.findOne({ command:msg[0].toLowerCase()}).response})
  }

  //GET ID
  if(message === '!getID'){
    bot.sendMessage( {to:channelID, message: userID})
  }

  //LIST COMMANDS
  if(message  ===  '!commands'){
    var cmds = commands.where(function(obj) {
      if(!obj.hidediscord)
        return true;
      return false;
    });
    msg = ''
    for(i=0;i<cmds.length;i++){
      msg += cmds[i].command
      if(i != cmds.length -1){
        msg += ', '
      }
    }
    bot.sendMessage( {to:channelID, message: msg})
  }
  db.saveDatabase();
});
