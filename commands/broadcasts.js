module.exports = {
  addbrd: function (client, broadcasts, channel, message) {
    parts = message.split(" ")
    if(broadcasts.findOne({ id:parts[1].toLowerCase()})){
      client.say(channel, 'Broadcast existiert bereits, !editbrd ' + parts[1] + ' um ihn zu bearteiben.' )
      return
    }
    if(isNaN(parts[2]) || parts[2]%1 != 0){
      return
    }
    response = '';
    for(i=3;i<parts.length;i++){
      response += parts[i] + ' '
    }
    broadcasts.insert({
      id: parts[1].toLowerCase(),
      response: response,
      freq: parts[2]
    });
    client.say(channel, 'Broadcast hinzugefügt, ID:' + parts[1] + ' gibt nun: "'+ response +'" alle '+parts[2]+' aus.' )
  },
  delbrd: function (client, broadcasts, channel, message) {
    parts = message.split(" ")
    if(!broadcasts.findOne({ id:parts[1]})){
      client.say(channel, 'Broadcast '+ parts[1] +' existert nicht.' )
      return
    }
    toRemove = broadcasts.findOne({ id:parts[1]});
    broadcasts.remove(toRemove);
    client.say(channel, 'Broadcast ' + parts[1] + ' entfernt.' )
  },
  playbrd: function (client, broadcastdb, channel, time) {
    var broadcasts = broadcastdb.where(function (obj) {
      return true;
    });
    for(i=0; i<broadcasts.length; i++){
      if(time % broadcasts[i].freq == 0)
        client.say(channel, broadcasts[i].response)
    }
  }
};
