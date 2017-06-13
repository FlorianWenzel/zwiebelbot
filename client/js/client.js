var sock = io();

sock.on('increaseOnions', onIncrease);

function onIncrease(all, amount, username) {
    spinit(all, amount, username);
}
