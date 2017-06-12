var sock = io();

sock.on('increaseOnions', onIncrease);

function onIncrease(amount) {
    spinit(amount);
}
