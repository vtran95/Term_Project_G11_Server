const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const con =  mysql.createPool( {
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'bdd578191d96cc',
    password: '8bde2986',
    database: 'heroku_1ddda9c9cbecd43'
});

const app = express();

app.use('*', cors());

app.listen(process.env.PORT || 5000, (err) => {
    if (err) throw err;
    console.log("Listening on port 5000");
} );