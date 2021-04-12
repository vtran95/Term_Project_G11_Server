const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

// Register user
app.post('/api/v1/register', async (req, res) => {   

    // let createTable = "CREATE TABLE IF NOT EXISTS User (id INT AUTO_INCREMENT, username VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) UNIQUE NOT NULL, PRIMARY KEY (id))";

    const username = req.body.username;
    const pass = req.body.password;    
    const encPass = await bcrypt.hash(pass, saltRounds);
    const checkUser = `SELECT * FROM User WHERE username = ${username}`;
    const registerSQL = `INSERT INTO User (username, email, password) VALUES ('${username}','${encPass}')`;  

    if (!username || !encPass) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

    con.query(checkUser, (error, results, fields) => {
        if (error) {     
            res.status(500);
            res.send({'error': 'Server error occurred'})      
        } else {       
            if (results.length > 0) {
                res.status(204);
                res.send({msg: 'Username already exists'});
            } else {
                con.query(registerSQL, (err, results2, field2) => {      
                    if (err) {     
                        res.status(500);
                        res.send({'error': 'Server error occurred'})      
                    } else {       
                        res.status(200);
                        res.send({msg: 'User registered successfully'})       
                    }    
                });  
            }      
        }   
    })
});

// Login user
app.post('/api/v1/login', (req, res) => {   
    const username = req.body.username;
    const pass = req.body.password;

    const searchUserSQL = `SELECT password FROM User WHERE username = '${username}'`;  

    if (!username || !encPass) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

    con.query(searchUserSQL, async (error, results, fields) => {      
        if (error) {     
            res.status(500);
            res.send({'error': 'Server error occurred'})      
        } else {       
            if (results.length > 0) {
                const comparePass = await bcrypt.compare(pass, results[0]);
                if (comparePass) {
                    res.status(200);
                    res.send({msg: 'User logged in successfully'});
                } else {
                    res.status(204);
                    res.send({msg: 'Username and password do not match'});
                }
            } else {
                res.status(206);
                res.send({msg: 'Username does not exist'});
            }     
        }    
    });  
});

// GET - Retrieve all Workouts
app.get('/api/v1/workouts', (req, res) => {
    // const createTableQuery = "CREATE TABLE IF NOT EXISTS Workout (id INT AUTO_INCREMENT, name VARCHAR(255), category VARCHAR(255), instructions VARCHAR(1024), equipment VARCHAR(255), amounts INT, PRIMARY KEY (id))";
    // const drop = 'DROP TABLE Workout';

    // const createTableQuery = "CREATE TABLE IF NOT EXISTS Session (id INT AUTO_INCREMENT, name VARCHAR(255), time FLOAT, PRIMARY KEY (id))";
    // const createStat = "INSERT INTO ApiStats (method, endpoint, requests) VALUES ('POST', '/api/v1/add_session', 0)";

    // con.query(createStat, (err, result, fields) => {
    //     if (err) {
    //         console.log(err);
    //         return res.sendStatus(503);
    //     }
    //     // console.log('Session table created');
    //     console.log('Session get all');
    //     return res.send();
    // });

    const getSQL = 'SELECT * FROM Workout';

    con.query(getSQL, (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.sendStatus(503);
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
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });
    
        console.log(JSON.stringify(result));
        res.status(200);
        return res.send(JSON.stringify(result));
    });
});

// POST - Create a new workout
app.post('/api/v1/add_exercise', (req, res) => {
    let name = req.body.name;
    let category = req.body.cat;
    let instructions = req.body.instructions;
    let equipment = req.body.equipment;
    let amounts = req.body.amounts;

    if (!name || !category || !instructions || !equipment || !amounts) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

    let postSQL = `INSERT INTO Workout (name, category, instructions, equipment, amounts) VALUES ('${name}', '${category}', '${instructions}', '${equipment}', '${amounts}')`;

    con.query(postSQL, (err, result, fields) => {
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
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully inserted to database');
        res.status(201);
        return res.send({msg: 'POST request successful'});
    });
});

// GET - Get random workout
app.get('/api/v1/random', (req, res) => {

    const sql = `SELECT * FROM Workout ORDER BY RAND() LIMIT 1`;
    const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/random'";

    con.query(sql, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(500);
            return res.send('No workouts found');
        }
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully retrieved random workout');
        res.status(200);
        return res.send(JSON.stringify(result));
    });
});

// POST - Get specific workout by first letter
app.post('/api/v1/search_fletter/:fletter', (req, res) => {
    const fletter = req.params.fletter;

    if (!fletter) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

    if (fletter.length > 1) {
        res.status(400);
        return res.send({'error': 'Search by first letter only accepts one letter'});
    }

    let sql = `SELECT * FROM Workout WHERE name LIKE '${fletter}%'`;

    con.query(sql, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(404);
            return res.send(`Workouts with first letter '${fletter}' could not be found`);
        }

        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/search_fletter/:fletter'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully retrieved workout from first letter');
        res.status(200);
        return res.send(JSON.stringify(result));
    });
});

// GET - Get specific workout by name
app.get('/api/v1/search_name/:name', (req, res) => {
    const name = req.params.name;
    console.log(name);

    if (!name) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

    let sql = `SELECT * FROM Workout WHERE name = '${name}'`;

    con.query(sql, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(404);
            return res.send('Workout name could not be found');
        }

        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/search_name/:name'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully retrieved workout from name');
        console.log(name);
        res.status(200);
        return res.send(JSON.stringify(result));
    });
});

// POST - Get specific workout by id
app.post('/api/v1/search_id/:id', (req, res) => {
    const id = req.params.id;

    if (!id) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

    const sql = `SELECT * FROM Workout WHERE id = ${id}`;
    const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/search_id/:id'";

    con.query(sql, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(404);
            return res.send('Workout id could not be found');
        }
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully retrieved workout from id');
        res.status(200);
        return res.send(JSON.stringify(result));
    });
});

// GET - Get specific workout by category
app.get('/api/v1/category/:category', (req, res) => {
    const cat = req.params.category;

    if (!cat) {
        res.status(400);
        return res.send({'error': 'Missing filter parameters'});
    }

    let sql = `SELECT * FROM Workout WHERE UPPER(category) = UPPER('${cat}')`;

    con.query(sql, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(404);
            return res.send(`Workouts with category '${cat}' could not be found`);
        }

        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/filter/:category'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully retrieved filtered workouts');
        res.status(200);
        return res.send(JSON.stringify(result));
    });
});

// DELETE - Delete a workout
app.delete('/api/v1/delete/:name', (req, res) => {
    const name = req.params.name;

    const deleteSQL = `DELETE FROM Workout WHERE name = '${name}'`;
    con.query(deleteSQL, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(400);
            return res.send('Workout name could not be found');
        }

        // const deleteStat = `DELETE FROM ApiStats WHERE endpoint = '/api/v1/delete/:name'`;
        // const createStat = "INSERT INTO ApiStats (method, endpoint, requests) VALUES ('DELETE', '/api/v1/delete/:name', 0)";
        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/delete/:name'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully deleted item from database');
        res.status(200);
        return res.send({msg: 'DELETE request successful'});
    })
});

// PUT - Update a workout's name
app.put('/api/v1/update', (req, res) => {
    const oldName = req.body.oldName;
    const newName = req.body.newName;

    const updateSQL = `UPDATE Workout SET Workout.name = '${newName}' WHERE Workout.name = '${oldName}'`;
    con.query(updateSQL, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(400);
            return res.send('Workout name could not be found');
        }

        // const createStat = "INSERT INTO ApiStats (method, endpoint, requests) VALUES ('PUT', '/api/v1/update', 0)";
        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/update'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully updated database');
        res.status(200);
        return res.send({msg: 'PUT request successful'});
    })
});

// GET - Retrieve all Sessions
app.get('/api/v1/sessions', (req, res) => {

    const getSQL = 'SELECT * FROM Session';

    con.query(getSQL, (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.sendStatus(503);
        }
        if (result.length == 0) {
            console.log(JSON.stringify(result));
            res.status(404);
            return res.send('No sessions found');
        }

        // const createStat = "INSERT INTO ApiStats (method, endpoint, requests) VALUES ('GET', '/api/v1/workouts', 0)";
        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/sessions'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });
    
        console.log(JSON.stringify(result));
        res.status(200);
        return res.send(JSON.stringify(result));
    });
});

// POST - Create a new workout session
app.post('/api/v1/add_session', (req, res) => {
    const name = req.body.name;
    const time = req.body.time;

    if (!name || !time) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

    // const createTableQuery = "CREATE TABLE IF NOT EXISTS Session (id INT AUTO_INCREMENT, name VARCHAR(255), time FLOAT, PRIMARY KEY (id))";

    let postSQL = `INSERT INTO Session (name, time) VALUES ('${name}', '${time}')`;

    con.query(postSQL, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(500);
            return res.send('Something went wrong with the server');
        }

        // const createStat = "INSERT INTO ApiStats (method, endpoint, requests) VALUES ('POST', '/api/v1/add_session', 0)";
        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/add_session'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully inserted to database');
        res.status(201);
        return res.send({msg: 'POST request successful'});
    });
});

// DELETE - Delete a workout session
app.delete('/api/v1/delete_session/:name', (req, res) => {
    const name = req.params.name;
    console.log(name);

    const deleteSQL = `DELETE FROM Session WHERE name = '${name}'`;
    con.query(deleteSQL, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(400);
            return res.send('Workout session name could not be found');
        }

        // const createStat = "INSERT INTO ApiStats (method, endpoint, requests) VALUES ('DELETE', '/api/v1/delete_session/:name', 0)";
        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/delete_session/:name'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully deleted item from database');
        res.status(200);
        return res.send({msg: 'DELETE request successful'});
    })
});

// PUT - Update a workout session's time
app.put('/api/v1/update_session', (req, res) => {
    const name = req.body.name;
    const time = req.body.time;

    const updateSQL = `UPDATE Session SET time = '${time}' WHERE Workout.name = '${name}'`;
    con.query(updateSQL, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(400);
            return res.send('Workout name could not be found');
        }

        // const createStat = "INSERT INTO ApiStats (method, endpoint, requests) VALUES ('PUT', '/api/v1/update_session', 0)";
        const updateStat = "UPDATE ApiStats SET requests = requests + 1 WHERE endpoint = '/api/v1/update_session'";
        con.query(updateStat, (statErr, statResult, statFields) => {
            if (statErr) {
                console.log(statErr); 
                res.status(500);
                return res.send('Something went wrong with the server');
            }
            console.log(JSON.stringify(statResult));
        });

        console.log('Successfully updated database');
        res.status(200);
        return res.send({msg: 'PUT request successful'});
    })
});

// GET - Retrieve all API endpoint stats
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