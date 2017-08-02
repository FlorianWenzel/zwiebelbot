var sock = io();

sock.on('increaseOnions', onIncrease);
sock.on('bohlen', function(number){
  document.getElementById('frame').src = 'http://www.dxj.de/smp/index.php?s=bohlen/' + number
})
sock.on('sunshine', function(){
  document.getElementById('sun').classList.remove('hide')
  setInterval(function () {
    document.getElementById('sun').classList.add('hide')
  }, 10000)
})
function onIncrease(all, amount, username) {
    spinit(all, amount, username);
}
