var request = require('request')
class participant {
  constructor(name, buyin, winchance) {
    this.name = name;
    this.buyin = buyin;
    this.winchance = winchance;
  }
}

function sortParticipants(a, b){
  if(a.buyin < b.buyin){
    return 1;
  }
  if (a > b){
    return -1;
  }
  return 0;
}

module.exports = {
  knowUser: function(users, username){
    if(!users.findOne({name:username})){
      users.insert({
        name: username,
        gambleCooldown: new Date().getTime() - 100000000,
        coins: 0
      });
    }
    return;
  },
  giveCoins: function(channel, users, twitchID){
    var online;
    request({
        url: 'https://api.twitch.tv/kraken/streams/'+channel+'?client_id=' + twitchID,
        json: true
    }, function (error, response, body) {
      if(!error && body.stream != null){
        request({
            url: "https://tmi.twitch.tv/group/user/"+channel+"/chatters",
            json: true
        }, function (error, response, body) {
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
            }
          })
      }
    })
  },
  viewCoins: function (client, users, channel, userstate) {
    if(users.findOne({ name:userstate.username})){
      client.say(channel, userstate.username + ' besitzt '+users.findOne({ name:userstate.username}).coins.toString() + ' ZwiebelCoins!')
    }
  },
  send: function (client, users, channel, userstate, message) {
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
          client.say(channel, 'Ich kenne keinen ' + msg[1]+ '.')
          return;

      }
    }
  },
  setCoins: function (client, users, channel, userstate, message) {
    msg = message.split(" ")
    if(msg.length != 3 || msg[0] != "!set" || isNaN(msg[2]) || parseInt(msg[2])<=0){
      client.say(channel, 'Benutz !set <User> <Wie viel>')
    }else {
      getter = users.findOne({ name:msg[1].toLowerCase()});
      if(getter){
        getter.coins = parseInt(msg[2]);
        client.say(channel, msg[1] + ' hat '+msg[2]+' nun ZwiebelCoins.')
      }else{
          client.say(channel, 'Ich kenne keinen ' + msg[1]+ '.')
          return;

      }
    }
  },
  convert: function (client, users, channel, userstate, message) {
    msg = message.split(" ")
    if(msg.length != 2 || isNaN(msg[1]) || msg[1] < 1){
      client.say(channel, 'Benutze !convert <Anzahl> um Coins zu convertieren!')
    }else if(users.findOne({ name:userstate.username}).coins < msg[1]){
      client.say(channel, 'Sorry, zu wenig ZwiebelCoins')
    }else{
      console.log('#asbestbot'+'/'+ 'WANT_TO_CONVERT:' + userstate.username + ':' + msg[1])
      client.whisper('#asbestbot', 'WANT_TO_CONVERT:' + userstate.username + ':' + msg[1])
    }
  },
  cashIn: function (client, pokersite, users, channel, userstate, message) {
    msg = message.split(' ')
    if(msg.length != 3 || isNaN(msg[2])){
      client.say(channel, 'Syntaxfehler :/, benutz !poker <Dein DukePoker Name> <Anzahl>')
      return;
    }
    if(users.findOne({name:userstate.username}).coins < parseInt(msg[2])){
      client.say(channel, 'Zu wenig ZwiebelCoins')
      return;
    }
    pokersite.emit('cashIn', {sender:'zwiebelbot',username:msg[1], amount:parseInt(msg[2]), twitch:userstate.username});
  },
  cashInSuccessFull: function (client, amount, users, username, channel){
    user = users.findOne({name:username});
    user.coins -= parseInt(amount);
    client.say(channel, username + ' hat ' + amount + ' ZwiebelCoins erfolgreich eingezahlt.')
  },
  cashInUnsuccessFull: function (client, amount, users, username, channel){
    client.say(channel, '@' + username + ' der angegebene DukePoker Name existiert nicht :( Achte auf Groß/Kleinschreibung (keine Sorge dir wurden keine ZwiebelCoins abgebucht)')
  },
  receiveConvert: function (client, users, from, message) {
    if(from != '#asbestbot')
      return;
    msg = message.split(":")
    receiver = users.findOne({ name:msg[1]})
    if(!receiver){
      return;
    }else{
      receiver.coins += parseInt(msg[2])
      client.whisper('#asbestbot', 'CONVERT_SUCCESSFULL:' + msg[1] + ':' + msg[2])
    }

  },
  convertSuccessfull: function (client, users, from, message) {
    if(from != '#asbestbot')
      return;
    msg = message.split(":")
    client.say('pokerzwiebel', 'Convert erfolgreich!')
    users.findOne({name:msg[1]}).coins -= parseInt(msg[2])
  },
  startLottery: function (client, message, lottery, channel) {
    parts = message.split(" ");
    if(isNaN(parts[1]) && parts[1] != "NL"){
      client.say(channel, 'Syntaxerror. Benutz !startLottery <Max Einsatz oder NL für NoLimit>')
      return
    }
    if(lottery.findOne({ index:0})){
    }else{
      lottery.insert({
        index: 0,
        enabled: false,
        maxbuyin: 0,
        participants: new Array
      });
    }
    if(lottery.findOne({index:0}).enabled){
      client.say(channel, 'Gewinnspiel läuft bereits.')
    }else{
      client.say(channel, 'Gewinnspiel gestartet!')
      lottery.findOne({ index:0 }).participants = [];
      lottery.findOne({ index:0 }).maxbuyin = parts[1];
      lottery.findOne({index:0}).enabled = true;
    }
  },
  participateLottery: function (client, users, channel, userstate, message, lottery) {
    parts = message.split(" ")
    lotto = lottery.findOne({index:0});
      if(lotto.enabled && parts.length == 2 && !isNaN(parts[1]) && parseInt(parts[1])>0 && parseInt(parts[1])%1 == 0){
        if(users.findOne({ name:userstate.username}).coins >= parseInt(parts[1])){
          for(i = 0; i < lotto.participants.length; i++){
            if(lotto.participants[i].name == userstate.username){
              if(lotto.participants[i].buyin + parseInt(parts[1]) <= lotto.maxbuyin || lotto.maxbuyin == "NL"){
                lotto.participants[i].buyin += parseInt(parts[1]);
                users.findOne({ name:userstate.username}).coins -= parseInt(parts[1]);
                client.say(channel, 'Du hast nun ' + lotto.participants[i].buyin + ' investiert')
              }else{
                client.say(channel, 'Sorry, dann wärst du über dem Maximum von ' + lotto.maxbuyin + '!')
              }
              return;
            }
          }
          if(parseInt(parts[1]) <= lotto.maxbuyin || lotto.maxbuyin == "NL"){
            users.findOne({ name:userstate.username}).coins -= parseInt(parts[1]);
            lotto.participants.push(new participant(userstate.username, parseInt(parts[1]), 0));
            client.say(channel, 'Du hast nun ' + parts[1] + ' investiert')
          }else{
            client.say(channel, 'Sorry, dann wärst du über dem Maximum von ' + lotto.maxbuyin + '!')
          }
        }else{
          client.say(channel, 'Zu wenig ZwiebelCoins')
        }
      }else{
        if(lotto.enabled){
          client.say(channel, 'Syntaxerror, bitte überpüfe deine Eingabe :)')
        }else{
          client.say(channel, 'Im moment läuft kein Gewinnspiel!')
        }
      }
  },
  showLotteryStats: function (client, users, channel, userstate, message, lottery){
    lotto = lottery.findOne({index:0});
    if(!lotto.enabled){
      client.say(channel, "Es läuft gerade kein Gewinnspiel.")
      return
    }
    user = users.findOne({ name:userstate.username});
    lotto.participants.sort(sortParticipants)
    oddsMsg = '';
    allBuyins = 0;
    for (var i = 0; i < lotto.participants.length; i++){
      allBuyins += lotto.participants[i].buyin;
    }
    for (var i = 0; i < lotto.participants.length; i++) {
      lotto.participants[i].winchance = lotto.participants[i].buyin/allBuyins;
      oddsMsg += lotto.participants[i].name + ' Buyin: ' + lotto.participants[i].buyin + ' Winchance: ' +  Math.round(lotto.participants[i].winchance*100)+'%    ';
    }
    client.say(channel, oddsMsg)
  },
  endLottery: function (client, lottery, channel) {
      lotto = lottery.findOne({index:0});
      if(!lotto.enabled){
        client.say(channel, 'Es läuft kein Gewinnspiel.')
        return
      }
      lotto.participants.sort(sortParticipants)
      lotto.enabled = false;
      allBuyins = 0;
      oddsMsg = '';
      for (var i = 0; i < lotto.participants.length; i++){
        allBuyins += lotto.participants[i].buyin;
      }
      for (var i = 0; i < lotto.participants.length; i++) {
      lotto.participants[i].winchance = lotto.participants[i].buyin/allBuyins;
        oddsMsg += lotto.participants[i].name + ' Buyin: ' + lotto.participants[i].buyin + ' Winchance: ' +  Math.round(lotto.participants[i].winchance*100)+'%    ';
      }
      var random = Math.random();
      client.say(channel, oddsMsg)
      prev = 0;
      if(lotto.participants.length > 10){
        toDisplay = 10;
      }else{
        toDisplay = lotto.participants.length
      }
      for (var i = 0; i < toDisplay; i++) {
        console.log(random)
        if(lotto.participants[i].winchance + prev > random || i == lotto.participants.length - 1){
          client.say(channel, 'Gewinner: ' + lotto.participants[i].name + '!')
          return;
        }else{
          prev += lotto.participants[i].winchance;
        }
      }
      client.say(channel, 'Gewinnspiel beendet.')
    },
    cancelLottery: function (client, users, lottery, channel) {
        lotto = lottery.findOne({index:0});
        if(!lotto.enabled){
          client.say(channel, 'Es läuft kein Gewinnspiel.')
          return
        }
        lotto.participants.sort(sortParticipants)
        lotto.enabled = false;
        allBuyins = 0;
        oddsMsg = '';
        for (var i = 0; i < lotto.participants.length; i++){
          users.findOne({ name:lotto.participants[i].name}).coins += lotto.participants[i].buyin;
        }
        lotto.participants = []
        client.say(channel, 'Gewinnspiel abgebrochen und Einsätze zurückerstattet.')
      },
    giessen: function (client, io, username, message, misc, users, channel) {
        msg = message.split(" ");
        if(isNaN(msg[1]) || msg.length != 2 || parseInt(msg[1]) < 1){
          client.say(channel, 'Syntaxfehler :(')
          return;
        }
        if(users.findOne({name:username}).coins < parseInt(msg[1])){
          client.say(channel, 'Du hast zu wenig Zwiebelcoins.')
          return;
        }else{
          users.findOne({name:username}).coins -= parseInt(msg[1])
        }
        misc.findOne({id:'zwiebelbeetCounter'}).value += parseInt(msg[1])
        client.say(channel, username + ' hat ' + msg[1] + " Zwiebeln gegossen (jetzt:" +misc.findOne({id:'zwiebelbeetCounter'}).value % 10000  + '/10000)')
        io.sockets.emit('increaseOnions', (misc.findOne({id:'zwiebelbeetCounter'}).value % 10000), parseInt(msg[1]), username);
        }

  };
