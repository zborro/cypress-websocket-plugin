const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

function substituteVariables(ref, variables) {
    if (!ref.startsWith("$")) {
        return ref;
    }

    const varName = ref.slice(1);
    if (!(varName in variables)) {
        return ref;
    }

    return variables[varName];
}


function startFakeWebsocketServer(serverConfig) {
    const app = express();
    const port = 3000;
    const server = app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });

    const io = require('socket.io').listen(server);
    app.use(cors({ origin: '*' }));
    app.use(bodyParser.json());

    let messages = [];
    let variables = (serverConfig && serverConfig.variables) || [];
    let timers = [];
    let options = (serverConfig && serverConfig.options) || {
        responses: {},
        periodicMessages: [],
    };

    function setup(socket) {
        console.log("Setting up new socket with opts:", options);

        Object.keys(options.responses).forEach(function(key) {
            socket.on(key, () => {
                const [command, ...params] = options.responses[key]
                socket.emit(command, ...params);
            });
        });

        options.periodicMessages.forEach(v => {
            timers.push(setInterval(
                () => {
                    socket.emit(v.name, ...(v.args.map(x => substituteVariables(x, variables))));
                },
                v.interval,
            ));
        });
    }

    function cleanup() {
        timers.map(clearInterval);
        timers = [];
    }

    app.get('/__cypress/messages', (req, res) => {
        res.json(messages);
    });

    app.delete('/__cypress/messages', (req, res) => {
        messages = [];
        res.json();
    });

    app.get('/__cypress/options', (req, res) => {
        res.json(options);
    });

    app.post('/__cypress/options', (req, res) => {
        options = req.body;
        res.json();
        cleanup();
    });

    app.get('/__cypress/variables', (req, res) => {
        res.json(variables);
    });

    app.post('/__cypress/variables', (req, res) => {
        variables[req.params.name] = req.params.value;
        res.json();
    });

    io.on('connection', socket => {
        var onevent = socket.onevent;
        socket.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call(this, packet);
            packet.data = ["*"].concat(args);
            const name = args[0];
            if (!name.startsWith("__cypress")) {
                messages.push([...args]);
            }
        };

        setup(socket);
    });
}

module.exports = {
    startFakeWebsocketServer,
};
