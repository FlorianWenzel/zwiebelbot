var sock = io();

sock.on('increaseOnions', onIncrease);
sock.on('bohlen', function(number){
  document.getElementById('frame').src = 'http://www.dxj.de/smp/index.php?s=bohlen/' + number
})
function onIncrease(all, amount, username) {
    spinit(all, amount, username);
}
