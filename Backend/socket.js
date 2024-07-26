const { Server } = require('socket.io');

let io;

function configureSocket(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {

        socket.on('disconnect', () => {

        });
    });

    return io;
}

function emitUpdate(event, data) {
    if (io) {
        io.emit(event, data);
    }
}

module.exports = { configureSocket, emitUpdate };
