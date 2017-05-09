var admincmds = require('./commands/admincmds.js');
var coincmds = require('./commands/coincmds.js');
var casino = require('./commands/gamble.js')
var broadcast = require('./commands/broadcasts.js')
var account = require('./account.js');

var tmi = require('tmi.js')
var loki = require('lokijs')

var greet = false;
var channel = account.channel;
var options = {
  options: {
    debug: true
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
var db = new loki('database.db',
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
    coincmds.giveCoins(channel, users)
  }
  broadcast.playbrd(client, broadcasts, channel, timer);
  db.saveDatabase();
  timer++;
}
client.connect();
console.log('==================   ZWIEBELBOT START   ==================')
client.on("chat", (channel, userstate, message, self) => {
  if(self){
    return
  }
  coincmds.knowUser(users, userstate.username)
  //ADMIN FUNCTIONS

  //ADDCMD
  if (message.includes('!addcmd') && userstate.mod){
    admincmds.addcmd(client, commands, channel, userstate, message, self);
    return;
  //EDITCMD
  }else if(message.includes('!editcmd') && userstate.mod){
    admincmds.editcmd(client, commands, channel, userstate, message, self);
    return;
  //DELCMD
  }else if(message.includes('!delcmd') && userstate.mod){
    admincmds.delcmd(client, commands, channel, userstate, message, self);
    return;
  //GREET
  }else if(message.includes('!greet') && userstate.mod){
    greet = admincmds.greet(client, greet, channel);
    return;
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
  }

  //USER FUNCTIONS

  //LIST COMMANDS
  if(message.toLowerCase() ==  '!commands'){
    var cmds = commands.where(function(obj) {
    return true;
    });
    msg = ''
    for(i=0;i<cmds.length;i++){
      msg += cmds[i].command + ', '
    }
    msg += '!commands, !coins, !gamble, !send'
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

//WHISPERS
client.on("whisper", function (from, userstate, message, self) {
    if (self) return;
    if(message.includes('!HARDRESET-COINS') && (userstate.username == "dukexentis" || userstate.username == "pokerzwiebel")){
      users.removeDataOnly();
      return;
    }
    if (message.includes('!addcmd') && (userstate.username == "pokerzwiebel" || userstate.username == "dukexentis" || userstate.username == "sunshine_deluxe" || userstate.username == "onlyamiga")){
      parts = message.split(" ")
      if(commands.findOne({ command:parts[1]})){
        client.whisper(from, 'Command existiert bereits, !editcmd ' + parts[1] + ' um es zu bearteiben.' )
        return
      }
      response = '';
      for(i=2;i<parts.length;i++){
        response += parts[i] + ' '
      }
      commands.insert({
        command: parts[1].toLowerCase(),
        response: response,
        createdby: userstate.username
      });
      client.whisper(from, 'Command hinzugefügt, ' + parts[1] + ' gibt nun: "'+ response +'" aus.' )
    }else if(message.includes('!editcmd') && (userstate.username == "pokerzwiebel" || userstate.username == "dukexentis" || userstate.username == "sunshine_deluxe" || userstate.username == "onlyamiga")){
      parts = message.split(" ")
      if(!commands.findOne({ command:parts[1]})){
        client.whisper(from, 'Command existiert noch nicht, !addcmd ' + parts[1] + ' um es zu erstellen.' )
        return
      }
      response = '';
      for(i=2;i<parts.length;i++){
        response += parts[i] + ' '
      }
      cmd = commands.findOne({ command:parts[1]});
      cmd.response = parts[2];
      client.whisper(from, 'Command ersetzt, ' + parts[1] + ' gibt nun: "'+ response +'" aus.' )
    }else if(message.includes('!delcmd') && (userstate.username == "pokerzwiebel" || userstate.username == "dukexentis" || userstate.username == "sunshine_deluxe" || userstate.username == "onlyamiga")){
      parts = message.split(" ")
      if(!commands.findOne({ command:parts[1]})){
        client.whisper(from, 'Command '+ parts[1] +' existert nicht.' )
        return
      }
      oldcmd = commands.findOne({ command:parts[1]});
      commands.remove(oldcmd);
      client.whisper(from, 'Command ' + parts[1] + ' entfernt.' )
    }else if(message.includes('!greet') && (userstate.username == "pokerzwiebel" || userstate.username == "dukexentis" || userstate.username == "sunshine_deluxe" || userstate.username == "onlyamiga")){
      if(greet){
        greet = false;
        client.whisper(from, 'Begrüßung deaktiviert.')
      }else{
        greet = true;
        client.whisper(from, 'Begrüßung aktiviert.')
      }
    }
});


//GREETING
client.on("join", function (self, username) {
  console.log(username + ' is now watching the stream')
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
