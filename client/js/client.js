var sock = io();

sock.on('increaseOnions', onIncrease);

function onIncrease(amount) {
    spinit(amount);
}

var form = document.getElementById('chat-form');
form.addEventListener('submit', function(e) {
    var input = document.getElementById('chat-input');
    var value = input.value;
    input.value = '';
    sock.emit('msg', value);
    e.preventDefault();
});
