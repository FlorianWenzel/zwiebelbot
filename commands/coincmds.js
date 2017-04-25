module.exports = {
  viewCoins: function (client, users, channel, userstate, message, self) {
    if(users.findOne({ name:userstate.username})){
      client.say(channel, userstate.username + ' besitzt '+users.findOne({ name:userstate.username}).coins.toString() + ' ZwiebelCoins!')
    }
  },
  send: function (client, users, channel, userstate, message, self) {
    msg = message.split(" ")
    if(msg.length != 3 || msg[0] != "!send" || isNaN(msg[2]) || parseInt(msg[2])<=0){
      client.say(channel, 'Benutz !send <Empfänger> <Wie viel> um ZwiebelCoins zu verschicken!')
    }else {
      sender = users.findOne({ name:userstate.username});
      getter = users.findOne({ name:msg[1].toLowerCase()});
      if(sender && getter){
          if(sender.coins < parseInt(msg[2])){
            client.say(channel, 'Sorry du hast zu wenig ZwiebelCoins!')
          }else if(sender.name == getter.name){
            client.say(channel, 'Wieso würdest du das tun wollen?')
          }else{
              sender.coins -= parseInt(msg[2]);
              getter.coins += parseInt(msg[2]);
              client.say(channel, userstate.username + ' hat '+msg[2]+' ZwiebelCoins an '+msg[1]+' geschickt.')
          }
      }else{
          if(sender){
              client.say(channel, 'Ich kenne keinen ' + msg[1]+ '.')
              return;
          }
        client.say(channel, 'Sorry man aber ich kenne dich (noch) nicht! (Dauert 1-2 Minuten)') //TODO: JUST ADD HIS ASS
      }
    }
  },
  delcmd: function (client, commands, channel, userstate, message, self) {
      parts = message.split(" ")
      if(!commands.findOne({ command:parts[1]})){
        client.say(channel, 'Command '+ parts[1] +' existert nicht.' )
        return
      }
      oldcmd = commands.findOne({ command:parts[1]});
      commands.remove(oldcmd);
      client.say(channel, 'Command ' + parts[1] + ' entfernt.' )
  },
  greet: function(client, greet, channel, userstate, message, self){
    if(greet){
      greet = false;
      client.say(channel, 'Begrüßung deaktiviert.')
    }else{
      greet = true;
      client.say(channel, 'Begrüßung aktiviert.')
    }
    return greet;
  }
};
