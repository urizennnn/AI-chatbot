'use strict';

const SpeechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecog();
recognition.lang = 'en-US';
recognition.interimResults = false
const mic = document.querySelector('.mic');
const socket = io();


mic.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Clicked')
    recognition.start();
});

recognition.addEventListener('result', (e) => {
    const last = e.results.length - 1;
    const text = e.results[last][0].transcript;
    console.log('I said: ' + text);

    socket.emit('chat message', text);

});

recognition.addEventListener('speechstart', () => {
    console.log('Speech recognition started');
});

recognition.addEventListener('speechend', () => {
    console.log('Speech recognition ended');
});

