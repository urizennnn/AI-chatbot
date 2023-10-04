const express = require("express");
const app = express();
const morgan = require('morgan');
const path = require('path'); 

app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html')); 
});

app.listen(PORT, () => {
    console.log(`Server listening on localhost:${PORT}`);
});
