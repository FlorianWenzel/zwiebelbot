var forever = require('forever-monitor');

  var child = new (forever.Monitor)('bot.js', {
    max: 10,
    silent: false,
    args: []
  });

  child.on('exit', function () {
    console.log('bot.js has exited after 10 restarts');
  });
  child.on('restart', function (){
    console.log('I just crashed! (Crash #' + child.times + ' since restart) :( I will restart myself for now tho.')
  })
  child.start();
