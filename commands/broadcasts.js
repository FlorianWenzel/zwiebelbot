module.exports = {
  addbrd: function (client, broadcasts, channel, message) {
    parts = message.split(" ")
    if(broadcasts.findOne({ id:parts[1].toLowerCase()})){
      client.say(channel, 'Broadcast existiert bereits.' )
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
      freq: parts[2],
      paused: false
    });
    client.say(channel, 'Broadcast hinzugefügt, ID:' + parts[1] + ' gibt nun: "'+ response +'" alle '+parts[2]+'s aus.' )
  },
  delbrd: function (client, broadcasts, channel, message) {
    parts = message.split(" ")
    if(!broadcasts.findOne({ id:parts[1]})){
      client.say(channel, 'Broadcast '+ parts[1] +' existert nicht.' )
      return
    }
    toRemove = broadcasts.findOne({ id:parts[1]});
    broadcasts.remove(toRemove);
    client.say(channel, 'Broadcast ID:' + parts[1] + ' entfernt.' )
  },
  playbrd: function (client, broadcastdb, channel, time) {
    var broadcasts = broadcastdb.where(function (obj) {
      return true;
    });
    for(i=0; i<broadcasts.length; i++){
      if(!broadcasts[i].paused && time % broadcasts[i].freq == 0)
        client.say(channel, broadcasts[i].response)
    }
  },
  pausebrd: function (client, broadcasts, channel, message) {
    parts = message.split(" ")
    if(!broadcasts.findOne({ id:parts[1]})){
      client.say(channel, 'Broadcast '+ parts[1] +' existert nicht.' )
      return
    }
    toPause = broadcasts.findOne({ id:parts[1]});
    if(toPause.paused){
      client.say(channel, 'Broadcast ID:' + parts[1] + ' ist bereits pausiert.' )
      return
    }
    toPause.paused = true
    client.say(channel, 'Broadcast ID:' + parts[1] + ' pausiert.' )
  },
  unpausebrd: function (client, broadcasts, channel, message) {
    parts = message.split(" ")
    if(!broadcasts.findOne({ id:parts[1]})){
      client.say(channel, 'Broadcast '+ parts[1] +' existert nicht.' )
      return
    }
    toPause = broadcasts.findOne({ id:parts[1]});
    if(!toPause.paused){
      client.say(channel, 'Broadcast ID:' + parts[1] + ' ist nicht pausiert.' )
      return
    }
    toPause.paused = false
    client.say(channel, 'Broadcast ID:' + parts[1] + ' unpausiert.' )
  },
  listbrd: function (client, broadcastdb, channel) {
    var broadcasts = broadcastdb.where(function (obj) {
      return true;
    });
    msg = '';
    for(i=0; i<broadcasts.length; i++){
      if(!broadcasts[i].paused){
        msg += 'ID: ' + broadcasts[i].id + ' gibt: "' + broadcasts[i].response + '" alle '+broadcasts[i].freq + 's aus.'
      }else{
        msg += 'ID: ' + broadcasts[i].id + ' ist pausiert. Und gibt: "' + broadcasts[i].response + '" alle '+broadcasts[i].freq + 's aus.'
      }
    }
    client.say(channel, msg)
  }
};
