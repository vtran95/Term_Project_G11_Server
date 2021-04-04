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

// temp
app.set('view options', {layout: false});
app.use(express.static('frontend'));
app.use(express.json());
//

app.get('/api/v1/workouts', (req, res) => {
    // const createTableQuery = "CREATE TABLE IF NOT EXISTS Workout (id INT AUTO_INCREMENT, name VARCHAR(255), category VARCHAR(255), instructions VARCHAR(1024), equipment VARCHAR(255), amounts INT, PRIMARY KEY (id))";
    // const drop = 'DROP TABLE Workout';

    const sql = 'SELECT * FROM Workout';

    con.query(sql, (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.sendStatus(503);
            // return reject(err);
        }
        if (result.length == 0) {
            console.log(JSON.stringify(result));
            res.status(404);
            return res.send('No workouts found');
        }

        // const createStat = "INSERT INTO ApiStats (method, endpoint, requests) VALUES ('GET', '/api/v1/workouts', 0)";
        // const deleteStat = "DELETE FROM ApiStats WHERE id = 24";
        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/workouts'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
            }
            console.log(JSON.stringify(statResult));
        });
    
        console.log(JSON.stringify(result));
        return res.send(JSON.stringify(result));
    });
})

app.post('/api/v1/add_exercise', (req, res) => {
    console.log("hi");
    console.log(req.body);
    let name = req.body.name;
    let category = req.body.cat;
    let instructions = req.body.instructions;
    let equipment = req.body.equipment;
    let amounts = req.body.amounts;

    if (!name || !category || !instructions || !equipment || !amounts) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

    let sql = `INSERT INTO Workout (name, category, instructions, equipment, amounts) VALUES ('${name}', '${category}', '${instructions}', '${equipment}', '${amounts}')`;

    con.query(sql, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(500);
            return res.send('Something went wrong with the server');
        }

        // const createStat = "INSERT INTO ApiStats (method, endpoint, requests) VALUES ('POST', '/api/v1/add_exercise', 0)";
        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/add_exercise'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully inserted to database');
        res.status(200);
        return res.send({msg: 'POST request successful'});
    })

})

app.get('/api/v1/admin', (req, res) => {
    // const createTableQuery = "CREATE TABLE IF NOT EXISTS ApiStats (id INT AUTO_INCREMENT, method VARCHAR(255), endpoint VARCHAR(255), requests INT, PRIMARY KEY (id))";

    const sql = 'SELECT * FROM ApiStats';
    con.query(sql, (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.sendStatus(503);
        }
        if (result.length == 0) {
            console.log(JSON.stringify(result));
            res.status(404);
            return res.send('No requests found');
        }
        
        console.log(JSON.stringify(result));
        return res.send(JSON.stringify(result));
    });
})

app.listen(process.env.PORT || 5000, (err) => {
    if (err) throw err;
    console.log("Listening on port 5000");
} );