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
        //TODO: cleanup
        console.log('A user connected');

        socket.on('disconnect', () => {
            //TODO: cleanup
            console.log('User disconnected');
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
