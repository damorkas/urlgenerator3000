'use strict';
var names = [];

function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function fillData(obj) {
    document.getElementById('host').value = obj.host;
    document.getElementById('user').value = obj.user;
    document.getElementById('password').value = obj.password;
    document.getElementById('port').value = obj.port;
}

function getData(obj) {
    obj.host = document.getElementById('host').value;
    obj.user = document.getElementById('user').value;
    obj.password = document.getElementById('password').value;
    obj.port = document.getElementById('port').value;
}

function printData(data) {
    var table = document.getElementById('table');
    var tr, name, type;

    names = [];
    table.innerHTML = '';
    data.forEach(element => {
        tr = document.createElement('tr');
        tr.id = element.name;
        name = document.createElement('td');
        name.textContent = element.name;
        type = document.createElement('td');
        type.textContent = element.type;

        if (element.type === 'd') {
            tr.addEventListener('click', function () {
                document.getElementById('path').value = document.getElementById('path').value + '/' + this.id;
                sendJSON({ list: document.getElementById('path').value }, '/list');
            });

            tr.classList.add('catalog');
        } else {
            tr.classList.add('file');
        }

        names.push(element.name);

        tr.append(name);
        tr.append(type);
        table.append(tr);
    });
}

function printFailed() {
    var table = document.getElementById('table');
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.style = 'color: red;';
    td.textContent = 'server error..';
    tr.append(td);
    table.innerHTML = tr.innerHTML;
}

function sendJSON(obj, url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', url, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.timeout = 2000;

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            var response = xmlHttp.responseText;
            try {
                response = JSON.parse(response);
            } catch (error) {
                // 
            }

            if (xmlHttp.status === 200) {
                printData(response);
            } else {
                printFailed()
            }
        }
    }

    xmlHttp.send(JSON.stringify(obj));
}

ready(function () {
    var ftp = {
        host: 'test.rebex.net',
        user: 'demo',
        password: 'password',
        port: '21'
    };

    fillData(ftp);

    document.getElementById('ftp-connect').addEventListener('click', function (event) {
        getData(ftp);
        sendJSON(ftp, '/connect');
        document.getElementById('hyperLinks').innerHTML = '';
        document.getElementById('path').value = '';
    });

    document.getElementById('ftp-path').addEventListener('click', function (event) {
        var list = document.getElementById('path').value;
        document.getElementById('hyperLinks').innerHTML = '';
        sendJSON({ list: list }, '/list');
    });

    document.getElementById('ftp-back').addEventListener('click', function (event) {
        var list = document.getElementById('path').value.split('/');
        list.pop();
        list = list.join('/')
        document.getElementById('path').value = list;
        document.getElementById('hyperLinks').innerHTML = '';
        sendJSON({ list: list }, '/list');
    });

    document.getElementById('ftp-hyperlink').addEventListener('click', function (event) {
        var host = document.getElementById('host').value;
        var path = document.getElementById('path').value;
        var hyperLinks = document.getElementById('hyperLinks');
        var title, url, li;

        hyperLinks.innerHTML = '';
        names.forEach(function (name) {
            title = name;
            url = title.link('https://' + host + path + '/' + name);
            li = document.createElement('li');
            li.innerHTML = url;
            hyperLinks.append(li);
        });
    });
});