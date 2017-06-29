var deadCards = new Array;

class card {
  constructor(value, suit) {
    this.suit = suit;
    this.value = value;
  }
}

function beatiCard(card){
  if(card.value < 9){
    value = card.value + 2;
  }else if(card.value == 9){
    value = 'J'
  }else if(card.value == 10){
    value = 'Q'
  }else if(card.value == 11){
    value = 'K'
  }else if(card.value == 12){
    value = 'A'
  }
  if(card.suit == 0){
    suit = '♠'
  }else if(card.suit == 1){
    suit = '♦'
  }else if(card.suit == 2){
    suit = '♣'
  }else if(card.suit == 3){
    suit = '♥'
  }
  return value + suit;
}

function randomCard() {
  value = Math.floor(Math.random() * 12) + 0
  suit = Math.floor(Math.random() * 3) + 0
  newCard = new card(value, suit)
  if(deadCards.includes(newCard)){
    return randomCard();
  }
  deadCards.push(newCard)
  return newCard
}

module.exports = {
  gamble: function (client, users, channel, userstate, message) {
    msg = message.split(" ")
    if(msg.length != 2 || msg[0] != "!gamble" || isNaN(msg[1]) || parseInt(msg[1])<0){
      client.say(channel, 'Benutz !gamble <Einsatz> um zu gamblen!')
    }else {
        gambler = users.findOne({ name:userstate.username});
        if(gambler.coins < parseInt(msg[1])){
          client.say(channel, 'Sorry du hast zu wenig ZwiebelCoins!')
        }else{
          if(gambler.gambleCooldown == undefined || gambler.gambleCooldown + 900000 < new Date().getTime()){
            gambler.gambleCooldown = new Date().getTime();
            playerCard = randomCard();
            dealerCard = randomCard();
            if(playerCard.value > dealerCard.value){
              client.say(channel, beatiCard(playerCard) + ' > ' + beatiCard(dealerCard) +' => Gewonnen!')
              gambler.coins += parseInt(msg[1]);
            }else if(playerCard.value < dealerCard.value){
              client.say(channel, beatiCard(playerCard) + ' < ' + beatiCard(dealerCard) +' => Verloren!')
              gambler.coins -= parseInt(msg[1]);
            }else{
              client.say(channel, beatiCard(playerCard) + ' = ' + beatiCard(dealerCard) +' => Unendschieden!')
            }
            chips = gambler.coins;
            client.say(channel, userstate.username + ' hat jetzt ' + chips.toString() + ' ZwiebelCoins')
            deadCards = [];
        }else{
          client.say(channel, 'Sorry ' + userstate.username + ', du musst noch ' + (Math.floor(15+(gambler.gambleCooldown - new Date().getTime())/60000)).toString() +":" + (60 + Math.floor((gambler.gambleCooldown - new Date().getTime())/1000) % 60).toString()  + 'm warten bevor du wieder Gambeln kannst')
        }
      }
    }
  },
  slots: function slots(client, misc, users, channel, userstate, message) {
    jackpot = misc.findOne({ id:'jackpot' })
    if(!(misc.findOne(jackpot))){
      misc.insert({
        id: 'jackpot',
        pot: 10000
      });
      jackpot = misc.findOne({ id:'jackpot' })
    }
    parts = message.split(' ')
    user = users.findOne({name:userstate.username})
    if(parts.length != 2 || isNaN(parts[1]) || parts[1] < 1){
      client.say(channel, 'Benutz !slots <einsatz>')
      return;
    }
    if(user.coins < parts[1]){
      client.say(channel, 'Zu wenig Meth, sorry :(')
      return;
    }
    slotSymbols = [
      'MorphinTime',
      'TwitchLit',
      'TwitchRPG'
    ]

    user.coins -= parts[1];
    results = [];
    for(i=0;i<4;i++){
      random = Math.floor(Math.random() * 25) + 1
      if(random < 15){
        results[i] = slotSymbols[0]
      }else if (random < 23){
        results[i] = slotSymbols[1]
      }else{
        results[i] = slotSymbols[2]
      }
    }
    client.say(channel, '=[ ' + results[0] + ' ][ ' + results[1] +' ][ ' + results[2] + ' ][ ' + results[3] + ' ]=')
    var i = setInterval(showresult, 1000)
    function showresult() {
      if(results[0] == results[1] && results[1] == results[2] && results[2] == results[3]){
        multiplier = 2;
        switch (results[0]) {
          case 'MorphinTime':
            multiplier = 5;
            break;
          case 'TwitchLit':
            multiplier = 50;
            break;
          case 'TwitchRPG':
            multiplier = 1000;
            break;
        }
        client.say(channel, userstate.username + ' gewinnt ' + multiplier + 'x!')
        user.coins += parseInt(parts[1]) * (multiplier+1);
      }else{
      }
      clearInterval(i)
    }

  }
};
