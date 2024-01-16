const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Pointez vers le dossier parent de celui où se trouve server.js
app.use(express.static(path.join(__dirname, '..')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});