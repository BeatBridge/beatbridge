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
        console.log('A user connected', socket.id);

        // Join the user to a room named by their user ID
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        });

        // Handle private messages
        socket.on('private_message', (data) => {
            const { to, message } = data;
            socket.to(to).emit('private_message', {
                message,
                from: socket.id,
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
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
