require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const userRoutes = require("./routes/userRoutes");
const { configureSocket } = require('./socket.js');

require('./utils/cronJobMap.js');
require('./utils/cronJobTrendingArtists.js')

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
