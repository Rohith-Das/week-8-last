const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');


const userRouter = require('./routes/userRouter');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change to true if using HTTPS
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views/user');
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

mongoose.connect("mongodb://localhost:27017/roshow", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Use userRouter for handling routes
app.use('/', userRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
