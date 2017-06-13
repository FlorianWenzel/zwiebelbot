var forever = require('forever-monitor');
var Discord = require('discord.io')
var account = require('./account.js')

  var child = new (forever.Monitor)('bot.js', {
    max: 10,
    silent: false,
    args: []
  });

  child.on('exit', function () {
    console.log('bot.js has exited after 10 restarts');
  });
  child.on('restart', function (){
    var bot = new Discord.Client({
        token: account.token,
        autorun: true
    });
    bot.on('ready', function() {
        bot.sendMessage({to:'313369459689652225', message:'I just crashed! (Crash #' + child.times + ' since restart) :( I will restart myself for now tho.'})
    });
  })
  child.start();
