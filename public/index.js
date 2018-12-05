'use strict';

function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function generator() {
    var names = [];

    var ftp = {
        host: 'pixelhouse.lt',
        user: 'piouse',
        pass: '',
        port: '21'
    };

    var b = (function () {
        return {
            connect: document.getElementById('connect'),
            disconnect: document.getElementById('disconnect'),
            gotopath: document.getElementById('gotopath'),
            back: document.getElementById('back'),
            makehyperlinks: document.getElementById('makehyperlinks')
        }
    }());

    var i = (function () {
        return {
            user: document.getElementById('user'),
            pass: document.getElementById('pass'),
            host: document.getElementById('host'),
            port: document.getElementById('port'),
            path: document.getElementById('path'),
            hyperLinks: document.getElementById('hyperlinks'),
            table: document.getElementById('table'),
            status: document.getElementById('status'),
            urlExplanation: document.getElementById('urlexplanation')
        }
    }());

    function clean() {
        i.urlExplanation.innerHTML = '';
        i.hyperLinks.innerHTML = '';
        i.table.innerHTML = '';
        i.path.value = '';
    }

    function toggleConnection() {
        document.querySelectorAll('.toggleconnection').forEach(function (v, k) {
            v.getAttribute('disabled') === '' ? v.removeAttribute('disabled') : v.setAttribute('disabled', '');
        });
    }

    function printMsg(msg, isSuccess) {
        var span = document.createElement('span');
        isSuccess ? span.classList.add('success') : span.classList.add('error');
        span.textContent = msg;
        i.status.innerHTML = span.outerHTML;
    }

    function printFiles(data, server) {
        var tr, name, type;

        if (typeof data === 'string') {
            printMsg(data, false);
            return;
        }

        names = [];
        i.table.innerHTML = '';

        data.forEach(element => {
            tr = document.createElement('tr');
            tr.id = element.name;
            name = document.createElement('td');
            name.textContent = element.name;
            type = document.createElement('td');
            type.textContent = element.type;

            if (element.type == '1') {
                tr.addEventListener('click', function () {
                    i.path.value = i.path.value + this.id + '/';
                    server.ls({
                        ls: i.path.value
                    }, function (response, isSuccess) {
                        printFiles(response, server);
                        isSuccess ? printMsg('Working..', isSuccess) : printMsg(response, isSuccess);
                    });
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

    return {
        init: function () {
            i.host.value = ftp.host;
            i.user.value = ftp.user;
            i.pass.value = ftp.pass;
            i.port.value = ftp.port;
            printMsg('Disconnected..', false);
            clean();
        },
        getData: function () {
            return {
                host: i.host.value,
                user: i.user.value,
                pass: i.pass.value,
                port: i.port.value
            }
        },
        getButtons: function () {
            return b;
        },
        connected: function (response, isConnected, server) {
            if (isConnected) {
                toggleConnection();
                clean();
                printFiles(response, server);
                printMsg('Connected..', isConnected);
                i.path.value += '/';
            } else {
                printMsg(response, isConnected);
            }
        },
        disconnected: function (response, isConnected) {
            if (!isConnected) {
                toggleConnection();
                clean();
            }

            printMsg(response, isConnected);
        },
        generateHyperlinks: function () {
            var title, url, li;

            i.hyperLinks.innerHTML = '';
            i.urlExplanation.innerHTML = 'http:// + Host + Path + Name';
            names.forEach(function (name) {
                if (i.path.value[0] !== '/') {
                    i.path.value = '/' + i.path.value;
                } else if (i.path.value[i.path.value.length - 1] !== '/') {
                    i.path.value = i.path.value + '/';
                }

                var a = document.createElement('a');

                i.path.value = i.path.value.replace(/\/+/g, '/');

                a.text = name;
                a.href = 'http://' + i.host.value + i.path.value + name + '/';
                a.target = '_blank';


                //li = document.createElement('li');

                //li.innerHTML = a.outerHTML;
                i.hyperLinks.append(a);

                var br = document.createElement('br');
                i.hyperLinks.append(br);
            });
        },
        goToPath: function (server) {
            i.hyperLinks.innerHTML = '';
            i.urlExplanation.innerHTML = '';

            server.ls({
                ls: i.path.value
            }, function (response, isSuccess) {
                printFiles(response, server);
                isSuccess ? printMsg('Working..', isSuccess) : printMsg(response, isSuccess);
            });
        },
        goBack: function (server) {
            var list = i.path.value.split('/');
            
            if (list.length <= 1) return;

            var popped = list.pop();

            if (popped === '') {
                list.pop();
            }
            
            list = list.join('/')

            if (list[0] !== '/'){
                list = '/' + list;
            }

            if (list[list.length - 1] !== '/') {
                list = list + '/';
            }

            i.path.value = list;
            i.hyperLinks.innerHTML = '';
            i.urlExplanation.innerHTML = '';

            server.ls({
                ls: list
            }, function (response, isSuccess) {
                printFiles(response, server);
                isSuccess ? printMsg('Working..', isSuccess) : printMsg(response, isSuccess);
            });
        }
    };
}

function generatorServer() {
    var response;
    var rootPath = document.getElementById('rootpath').value;
    var urls = {
        connect: '/connect',
        disconnect: '/disconnect',
        ls: '/ls'
    };

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.timeout = 2000;

    return {
        connect: function (data, cb) {

            xmlHttp.open('POST', urls.connect, true);
            xmlHttp.setRequestHeader('Content-Type', 'application/json');

            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        try {
                            response = xmlHttp.responseText;
                            response = JSON.parse(response);
                            cb(response, true);
                        } catch (error) {
                            response = 'Server error.. (JSON)';
                            cb(response, false);
                        }
                    } else {
                        response = 'Server error.. (status != 200)';
                        cb(response, false);
                    }
                }
            }

            data.root = rootPath;
            xmlHttp.send(JSON.stringify(data));
        },
        disconnect: function (cb) {
            xmlHttp.open('POST', urls.disconnect, true);
            xmlHttp.setRequestHeader('Content-Type', 'application/json');

            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        try {
                            response = xmlHttp.responseText;
                            cb(response, false);
                        } catch (error) {
                            response = 'Server error.. (Disconnect)';
                            cb(response, false);
                        }
                    } else {
                        response = 'Server error.. (status != 200)';
                        cb(response, false);
                    }
                }
            }

            xmlHttp.send(JSON.stringify({}));
        },
        ls: function (data, cb) {
            xmlHttp.open('POST', urls.ls, true);
            xmlHttp.setRequestHeader('Content-Type', 'application/json');

            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        try {
                            response = xmlHttp.responseText;
                            response = JSON.parse(response);
                            cb(response, true);
                        } catch (error) {
                            response = 'Server error.. (JSON)';
                            cb(response, false);
                        }
                    } else {
                        response = 'Server error.. (status != 200)';
                        cb(response, false);
                    }
                }
            }

            data.root = rootPath;
            xmlHttp.send(JSON.stringify(data));
        }
    };
}

ready(function () {
    var gen = generator();
    var server = generatorServer();
    var buttons = gen.getButtons();

    gen.init();

    buttons.connect.addEventListener('click', function (event) {
        server.connect(gen.getData(), function (response, isSuccess) {
            gen.connected(response, isSuccess, server);
        });
    });

    buttons.disconnect.addEventListener('click', function (event) {
        server.disconnect(function (response, isSuccess) {
            gen.disconnected(response, isSuccess);
        });
    });

    buttons.gotopath.addEventListener('click', function (event) {
        gen.goToPath(server);
    });

    buttons.back.addEventListener('click', function (event) {
        gen.goBack(server);
    });

    buttons.makehyperlinks.addEventListener('click', function (event) {
        gen.generateHyperlinks();
    });
});