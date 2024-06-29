const express = require('express');
const cors = require('cors');

const app = express();

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

app.use("/user", require("./routes/userRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
