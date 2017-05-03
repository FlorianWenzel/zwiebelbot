module.exports = {
  addcmd: function (client, commands, channel, userstate, message, self) {
    parts = message.split(" ")
    if(commands.findOne({ command:parts[1]})){
      client.say(channel, 'Command existiert bereits, !editcmd ' + parts[1] + ' um es zu bearteiben.' )
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
    client.say(channel, 'Command hinzugefügt, ' + parts[1] + ' gibt nun: "'+ response +'" aus.' )
  },
  editcmd: function (client, commands, channel, userstate, message, self) {
    parts = message.split(" ")
    if(!commands.findOne({ command:parts[1]})){
      client.say(channel, 'Command existiert noch nicht, !addcmd ' + parts[1] + ' um es zu erstellen.')
      return
    }
    response = '';
    for(i=2;i<parts.length;i++){
      response += parts[i] + ' '
    }
    cmd = commands.findOne({ command:parts[1]});
    cmd.response = response;
    client.say(channel, 'Command ersetzt, ' + parts[1] + ' gibt nun: "'+ response +'" aus.' )
  },
  delcmd: function (client, commands, channel, userstate, message, self) {
      parts = message.split(" ")
      if(!commands.findOne({ command:parts[1]})){
        client.say(channel, 'Command '+ parts[1] +' existert nicht.' )
        return
      }
      cmd = commands.findOne({ command:parts[1]});
      commands.remove(cmd);
      client.say(channel, 'Command ' + parts[1] + ' entfernt.' )
  },
  greet: function(client, greet, channel){
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
