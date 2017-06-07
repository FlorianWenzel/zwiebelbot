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
  broadcast.playbrd(client, broadcasts, channel, timer);
  db.saveDatabase();
  timer++;
}
client.connect();
console.log('*****TWITCHBOT ONLINE*****')
client.on("chat", (channel, userstate, message, self) => {
  console.log('<TWITCH> ' + userstate.username + ': ' + message)
  if(self){
    return
  }
  coincmds.knowUser(users, userstate.username)
  //ADMIN FUNCTIONS

  //ADDCMD
  if (message.includes('!addcmd') && userstate.mod){
    admincmds.addcmd(client, commands, channel, message);
    return;
  //EDITCMD
  }else if(message.includes('!editcmd') && userstate.mod){
    admincmds.editcmd(client, commands, channel, message);
    return;
  //DELCMD
  }else if(message.includes('!delcmd') && userstate.mod){
    admincmds.delcmd(client, commands, channel, message);
    return;
  //GREET
  }else if(message.includes('!greet') && userstate.mod){
    greet = admincmds.greet(client, greet, channel);
    return;
  }else if(message.includes('!hidediscord') && userstate.mod){
      admincmds.hidediscord('twitch', client, commands, channel, message);
  }else if(message.includes('!hidetwitch') && userstate.mod){
      admincmds.hidetwitch('twitch', client, commands, channel, message);
  }else if(message.toLowerCase().includes('!addbrd') && userstate.mod){
    broadcast.addbrd(client, broadcasts, channel, message);
  }else if(message.toLowerCase().includes('delbrd') && userstate.mod){
    broadcast.delbrd(client, broadcasts, channel, message);
  }else if(message.toLowerCase().includes('listbrd') && userstate.mod){
    broadcast.listbrd(client, broadcasts, channel);
  }else if(message.toLowerCase().includes('pausebrd') && !message.toLowerCase().includes('unpause') && userstate.mod){
    broadcast.pausebrd(client, broadcasts, channel, message);
  }else if(message.toLowerCase().includes('unpausebrd') && userstate.mod){
    broadcast.unpausebrd(client, broadcasts, channel, message);
  }else if(message.includes('!startLottery') && userstate.mod){
    coincmds.startLottery(client, message, lottery, channel);
  }else if(message.includes('!endLottery') && userstate.mod){
    coincmds.endLottery(client, lottery, channel);
  }else if(message.includes('!cancelLottery') && userstate.mod){
    coincmds.cancelLottery(client, users, lottery, channel);
  }

  //USER FUNCTIONS

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

  //COMMAND => ANSWER COMMANDS
  msg = message.split(" ")
  if(msg.length == 1 && commands.findOne({ command:msg[0].toLowerCase()})){
    client.say(channel, commands.findOne({ command:msg[0].toLowerCase()}).response)
  }
});


//GREETING
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
  db.saveDatabase();
});


//###################################################################################################################
//################################################### DISCORD BOT ###################################################
//###################################################################################################################

var bot = new Discord.Client({
    token: account.token,
    autorun: true
});

bot.on('ready', function() {
    console.log('*****DISCORDBOT ONLINE*****');
});

bot.on('message', function(user, userID, channelID, message, event) {
  //COMMAND => ANSWER COMMANDS
  console.log('<DISCORD> ' + user +': ' + message)
  if(message.includes('!hidediscord') && userID == 306705915162263562){
      admincmds.hidediscord('discord', bot, commands, channelID, message);
  }else if(message.includes('!hidetwitch') && userID == 306705915162263562){
      admincmds.hidetwitch('discord', bot, commands, channelID, message);
  }
  msg = message.split(" ")
  if(msg.length == 1 && commands.findOne({ command:msg[0].toLowerCase()})){
    bot.sendMessage({ to:channelID, message:commands.findOne({ command:msg[0].toLowerCase()}).response})
  }
  if(message === '!giveID'){
    bot.sendMessage( {to:channelID, message: userID})
  }
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
