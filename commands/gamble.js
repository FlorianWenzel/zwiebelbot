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
  gamble: function (client, users, channel, userstate, message, self) {
    msg = message.split(" ")
    if(msg.length != 2 || msg[0] != "!gamble" || isNaN(msg[1]) || parseInt(msg[1])<0){
      client.say(channel, 'Benutz !gamble <Einsatz> um zu gamblen!')
    }else {
      gambler = users.findOne({ name:userstate.username});
      if(gambler){
          if(gambler.coins < parseInt(msg[1])){
            client.say(channel, 'Sorry du hast zu wenig ZwiebelCoins!')
          }else{
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
          }
      }else{
        client.say(channel, 'Sorry man aber ich kenne dich (noch) nicht! (Dauert 1-2 Minuten)') //TODO: JUST ADD HIS ASS
      }
    }
  }
};
