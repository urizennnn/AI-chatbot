document.addEventListener('DOMContentLoaded', () => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.error("SpeechRecognition API is not supported in this browser.");
        // Handle unsupported browser here
        return;
    }

    const userText = document.querySelector('.text');
    const outputText = document.querySelector('.output-you');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    const botTextReply = document.querySelector('.output-bot');
    const mic = document.querySelector('.mic');
    const sendTextMessage = document.querySelector('.textSend')
    const socket = io();

    function apiVoiceResponse(text) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = text;
        utterance.lang = 'en-US';
        synth.speak(utterance);
    }

    sendTextMessage.addEventListener('click', () => {
        const userTextValue = userText.value
        outputText.textContent = userTextValue
        socket.emit('text', userTextValue)
        socket.on('text-reply', (reply) => {
            botTextReply.textContent = reply
        })
        console.log(userTextValue)
    })

    recognition.addEventListener('result', (e) => {
        const last = e.results.length - 1;
        const text = e.results[last][0].transcript.toString();
        console.log('I said: ' + text);
        outputText.textContent = `${text}`;

        // Emit the recognized text to the server if using Socket.io
        socket.emit('chat message', text);
    });

    mic.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Clicked');
        recognition.start();
    });

    recognition.addEventListener('end', () => {
        console.log('Speech recognition ended');
    });

    // Add error handling for speech recognition
    recognition.addEventListener('error', (event) => {
        console.error('Speech recognition error:', event.error);
    });

    // Handle the response from the server using Socket.io
    socket.on('bot reply', function (replyText) {
        apiVoiceResponse(replyText);
        botTextReply.textContent = `${replyText}`;
    });
});
