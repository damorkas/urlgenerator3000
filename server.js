const express = require('express');
const parser = require('body-parser');
const ftp = require('promise-ftp');

const app = express();
const port = 3000;
let client = new ftp();

app.use(express.static(__dirname + '/public'));
app.use(parser.json());

app.get('/test', (req, res) => {
    // TODO do not know if i will need this
});

app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/connect', async (req, res) => {
    const data = req.body;
    let items = [];

    if (client.getConnectionStatus() === 'connected') {
        await client.end();
    }

    client.connect({
        host: data.host,
        user: data.user,
        password: data.password,
        port: data.port,
        connTimeout: 1000
    }).then((msg) => {
        return client.list('/');
    }).then((list) => {
        items = list;
    }).finally(() => {
        res.send(items);
    });
});

app.post('/list', (req, res) => {
    const data = req.body;
    let items = [];

    client.list(
        data.list
    ).then((list) => {
        items = list;
    }).finally(() => {
        res.send(items);
    });
});

app.post('/disconnect', (req, res) => {
    client.destroy();
});

app.listen(app.get('port'), () => {
    console.log('app is listening on port ' + app.get('port') + '...');
});