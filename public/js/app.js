document.addEventListener('DOMContentLoaded', () => {
    // Check for browser support
    const SpeechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecog) {
        console.error("SpeechRecognition API is not supported in this browser.");
        // Handle unsupported browser here
        return;
    }

    const recognition = new SpeechRecog();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    const mic = document.querySelector('.mic');

    // Add Socket.io configuration if you're using it
    const socket = io();

    function apiVoiceResponse(text) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = text;
        utterance.lang = 'en-US'; // Set the desired language
        synth.speak(utterance);
    }

    mic.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Clicked');
        recognition.start();
    });

    recognition.addEventListener('result', (e) => {
        const last = e.results.length - 1;
        const text = e.results[last][0].transcript.toString()
        console.log('I said: ' + text);

        // Emit the recognized text to the server if using Socket.io
        socket.emit('chat message', text);
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
    });
});