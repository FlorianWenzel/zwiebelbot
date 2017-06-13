var sock = io();

sock.on('increaseOnions', onIncrease);

function onIncrease(amount, username) {
    spinit(amount, username);
}
