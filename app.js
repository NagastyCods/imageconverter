const express = require('express');
const path = require('path');
const imageRoutes = require('./routes/imageRoutes');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// api routes
app.use('/api/images', imageRoutes);
// serve static files

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});