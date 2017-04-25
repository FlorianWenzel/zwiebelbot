var admincmds = require('./commands/admincmds.js');
var coincmds = require('./commands/coincmds.js');
var casino = require('./commands/gamble.js')
var account = require('./account.js');

var tmi = require('tmi.js')
var loki = require('lokijs')
var request = require('request')

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
function loadHandler() {
    users = db.getCollection('users');
    commands = db.getCollection('commands');
    if (!users) {
        users = db.addCollection('users');
    }
    if (!commands) {
      commands = db.addCollection('commands');
    }
}

setInterval(interval, (60000))
function interval() {
  url = "https://tmi.twitch.tv/group/user/"+channel+"/chatters"
  request({
      url: url,
      json: true
  }, function (error, response, body) {
      console.log('Giving everybody 1 Coin...')
      if (!error && response.statusCode === 200) {
          viewer = new Array;
          for(i = 0; i < body.chatters.moderators.length; i++){
            viewer.push(body.chatters.moderators[i])
          }
          for(i = 0; i < body.chatters.viewers.length; i++){
            viewer.push(body.chatters.viewers[i])
          }
          for(i = 0; i < body.chatters.global_mods.length; i++){
            viewer.push(body.chatters.global_mods[i])
          }
          for(i = 0; i < body.chatters.admins.length; i++){
            viewer.push(body.chatters.admins[i])
          }
          for(i = 0; i < body.chatters.staff.length; i++){
            viewer.push(body.chatters.staff[i])
          }
          for(i = 0; i <viewer.length; i++){
            user = users.findOne({ name:viewer[i]});
            if(user){
              user.coins += 1
            }
          }
          console.log('...done')
        }
  })
}
client.connect();
console.log('==================   ZWIEBELBOT START   ==================')
client.on("chat", (channel, userstate, message, self) => {
  if(self){
    return
  }
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
    greet = admincmds.greet(client, greet, channel, userstate, message, self);
    return;
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
    coincmds.viewCoins(client, users, channel, userstate, message, self);
  //GAMBLE
  }else if(message.includes("!gamble")){
    casino.gamble(client, users, channel, userstate, message, self);
  //SEND COINS
  }else if(message.includes('!send')){
    coincmds.send(client, users, channel, userstate, message, self);
  }

  //COMMAND => ANSWER COMMANDS
  msg = message.split(" ")
  if(msg.length == 1 && commands.findOne({ command:msg[0]})){
    client.say(channel, commands.findOne({ command:msg[0]}).response)
  }

});

//WHISPERS
client.on("whisper", function (from, userstate, message, self) {
    if (self) return;
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
        command: parts[1],
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
