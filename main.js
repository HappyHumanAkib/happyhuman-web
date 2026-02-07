require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();

mongoose.connect(process.env.DB_URI).then(() => console.log('Connected to HappyHuman DB'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('uploads'));
app.use(express.static('public'));

app.use(session({
    secret: process.env.JWT_SECRET,
    saveUninitialized: true,
    resave: false
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.set('view engine', 'ejs');

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/', require('./routes/content'));

app.listen(process.env.PORT, () => console.log(`Server at http://localhost:${process.env.PORT}`));