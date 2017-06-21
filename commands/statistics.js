module.exports = {
  listusers: function (platform, bot, users, channel) {
    var userlist = users.where(function () {
      return true;
    })
    var zwiebelbot = users.findOne({ name:'zwiebeibot'})
    var nightbot = users.findOne({name:'nightbot'})
    var allCoins = 0;
    userlist.sort(sortByCoins);
    for(i=0; i<userlist.length; i++){
      allCoins += userlist[i].coins
      console.log(userlist[i].name + ' ' + userlist[i].coins)
    }
    allCoins = allCoins - nightbot.coins - zwiebelbot.coins
    msg = '=====OVERALL=====\n' +
          'Im twitchchat gesehene User: ' + userlist.length + '\n' +
          'Nightbot Zwiebelcoins: ' + nightbot.coins + '\n' +
          'ZwiebelBot Zwiebelcoins: ' + zwiebelbot.coins + '\n' +
          'Geld aller User (ohne Bots) zusammen: ' + allCoins + '\n==================\n\n'
    max = 10;
    if(userlist.length < 10)
      max = userlist.length;

    msg += '===MEISTEN COINS===\n';
    for(i=0; i<max;i++){
      msg += (i+1) + '. ' + userlist[i].name + '(' + userlist[i].coins + ')\n'
    }
    msg += '=================='
    say(platform, bot, channel, msg)
  }
};
function sortByCoins(a, b) {
  if(a.coins > b.coins)
    return -1;
  if(a.coins < b.coins)
    return 1;
  return 0;
}
function say(platform, bot, channel, message){
  if(platform == 'discord'){
    bot.sendMessage({to:channel, message:message})
  }else if(platform == 'twitch'){
    bot.say(channel, message)
  }else if(platform == 'twitchwhisper'){
    bot.whisper(channel, message)
  }
}
