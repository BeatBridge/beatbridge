require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const userRoutes = require("./routes/userRoutes");
const spotifyRoutes = require('./routes/spotifyRoutes.js');
const songRoutes = require('./routes/songRoutes.js');
const playlistRoutes = require('./routes/playlistRoutes.js');
const artistRoutes = require('./routes/artistRoutes.js');
const recommendationRoutes = require('./routes/recommendationRoutes.js')
const chatRoutes = require('./routes/chatRoutes.js')
const messageRoutes = require('./routes/messageRoutes.js')
const youtubeRoutes = require('./routes/ytMusicRoutes.js')
const utilityRoutes = require('./routes/utilityRoutes.js')
const { configureSocket } = require('./socket.js');

require('./utils/cronJobs.js');

const app = express();
const server = http.createServer(app);
configureSocket(server);

app.use(bodyParser.json())
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Test</title>
            </head>
            <body>
                <h1>Hello, World!</h1>
                <p>Welcome to my server.</p>
            </body>
        </html>
    `)
})

app.use("/user", userRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/songs", songRoutes);
app.use("/playlist", playlistRoutes);
app.use("/artists", artistRoutes);
app.use("/recommendation", recommendationRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);
app.use("/yt", youtubeRoutes)
app.use("/api", utilityRoutes)

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
