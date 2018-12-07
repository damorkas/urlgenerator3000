const express = require('express');
const parser = require('body-parser');
const jsftp = require('jsftp');

const app = express();
const PORT = process.env.PORT || 3000;

let ftps = undefined;

app.use(express.static(__dirname + '/public'));
app.use(parser.json());

app.get('/test', (req, res) => {
    // TODO do not know if i will need this
});

app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/connect', (req, res) => {
    const data = req.body;
    let interval;
    let items = [];
    let counter = 5;

    if (data.host === '' || data.port === '' || data.user === '' || data.pass === '') {
        res.send('Noup.. ');
        return;
    }

    try {
        ftps = new jsftp({
            host: data.host,
            port: data.port,
            user: data.user,
            pass: data.pass,
            timeout: 2
        });

        ftps.ls('/' + data.root, function (noup, files) {
            if (typeof files !== 'undefined') {
                items = files;
            }
        });

        interval = setInterval(function () {
            counter--;
            if (items.length > 0) {
                res.send(items);
                console.log('Connected. Hi!');
                clearInterval(interval);
            } else if (counter === 0) {
                res.send(items);
                console.log('counter = 0, err');
                clearInterval(interval);
            }
        }, 400);
    } catch (error) {
        res.send('500 in server(connect).. ' + error);
        console.log('500 in server(connect)..', error);
    }
});

app.post('/disconnect', (req, res) => {
    let isQuit = false;
    let counter = 5;
    let interval;

    try {
        ftps.raw('quit', (err, data) => {
            if (err) {
                res.send('quit failed.. ' + err);
                clearInterval(interval);
                return console.log('quit failed..', err);
            }

            isQuit = true;
        });

        interval = setInterval(function () {
            counter--;
            if (isQuit || counter === 0) {
                res.send('Disconnected..');
                console.log('Disconnected. Bye!');
                clearInterval(interval);
            }
        }, 400);
    } catch (error) {
        res.send('500 in server(disconnect).. ' + error);
        console.log('500 in server(disconnect)..', error);
    }
});

app.post('/ls', (req, res) => {
    const data = req.body;
    let interval;
    let items = [];
    let counter = 5;

    console.log('ls path:', data.ls);

    try {
        ftps.ls('/' + data.root + data.ls, function (noup, files) {
            if (typeof files !== 'undefined') {
                items = files;
            }
        });

        interval = setInterval(function () {
            counter--;
            if (items.length > 0 || counter === 0) {
                res.send(items);
                console.log('ls items:', items.length);
                clearInterval(interval);
            }
        }, 400);
    } catch (error) {
        res.send('500 in server(connect).. ' + error);
        console.log('500 in server(connect)..', error);
    }
});

app.post('/hyperlinks', (req, res) => {
    const data = req.body;

    try {
        if (data) {
            console.log('hyperlinks:\n', data.join('\n'));
        }
    } catch (error) {
        //
    } finally {
        res.send('(y)');
    }
});

app.listen(PORT, () => {
    console.log('app is listening on port ' + PORT + '...');
});
