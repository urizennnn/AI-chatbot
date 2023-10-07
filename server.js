const express = require("express");
const app = express();
const morgan = require('morgan');
const path = require('path');
const { SessionsClient } = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const dotenv = require('dotenv');
const Intent = require('./models/intents');
const connectDB = require('./db/connect');

dotenv.config();
app.use(morgan('dev'));

const projectId = process.env.PROJECT_ID;
const credentials = require('./apigen-401021-b0aa0107351c.json');
const PORT = process.env.PORT || 4000;

const sessionClient = new SessionsClient({
    projectId: projectId,
    credentials: credentials
});

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

app.use(express.static(path.join(__dirname, 'views')));

app.get('/credentials', (req, res) => {
    res.send(credentials).status(200);
});

async function detectIntent(projectId, text) {
    const sessionId = uuid.v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: text,
                languageCode: 'en-US',
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        const available = await Intent.find({});

        if (available.length > 0) {
            if (result.fulfillmentMessages.length === 0) {
                const mergedData = [...available, { intent: text }];
                await Intent.create({ intent: mergedData });
                return 'I have not been trained for that yet, check back later';
            }
        } else {
            if (result.fulfillmentMessages.length === 0) {
                await Intent.create({ intent: [{ intent: text }] });
                return 'I have not been trained for that yet, check back later';
            }
        }

        return result.fulfillmentText;
    } catch (error) {
        console.error('Error communicating with Dialogflow:', error.message);
        return 'Sorry, there was an error.';
    }
}

// Socket.IO connection handling
io.on('connection', function (socket) {
    socket.on('chat message', async (text) => {
        try {
            const aiText = await detectIntent(projectId, text);
            socket.emit('bot reply', aiText);
        } catch (error) {
            console.log(error);
            socket.emit('bot reply', "I couldn't find a reply, Sir.");
        }
    });
    socket.on('text',async(text)=>{
        try{
            const aiText = await detectIntent(projectId, text)
            socket.emit('text-reply',aiText)
        }catch(err){
            console.log(err)
            socket.emit('text-reply',err)
        }
    })

    
});

app.get('/test', (req, res) => {
    console.log(process.env.PROJECT_ID);
    res.status(200).json('check');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

(async () => {
    try {
        const connectionString = process.env.MONGO_URI || undefined;
        await connectDB(connectionString);
        http.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Something went wrong:", error);
    }
})();
