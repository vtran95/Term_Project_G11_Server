require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLStore = require('express-mysql-session')(session);
// const session = require('cookie-session');
const cors = require('cors');
const mysql = require('mysql');
// const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const saltRounds = 10;

const options = {
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'bdd578191d96cc',
    password: '8bde2986',
    database: 'heroku_1ddda9c9cbecd43'
}

const con =  mysql.createPool(options);
const sessionStore = new SQLStore({
    expiration: 60 * 10000
}, con);

const app = express();

// app.use('*', cors());

const whitelist = ['https://comp4537-termproj.herokuapp.com', 'http://localhost:5000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) != -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}
app.options('*', cors(corsOptions));

app.set('trust proxy', 1);
app.use(session({
    secret: 'secret',
    resave: false,
    store: sessionStore,
    saveUninitialized:  true,
    cookie: {
        secure: true,
        maxAge: 60 * 10000
    }
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// temp
app.set('view options', {layout: false});
app.use(express.static('frontend'));
app.use(express.json());
//

// Register user
app.post('/api/v1/register', cors(corsOptions), async (req, res) => {
    const username = req.body.username;
    const pass = req.body.password;
    console.log("pass and salt");
    console.log(req.body);
    console.log(username);
    console.log(pass);
    console.log(saltRounds);
    const encPass = await bcrypt.hash(pass, saltRounds);
    const apikey = randomString.generate({
        length: 12,
        charset: 'alphanumeric'
    });
    const checkUser = `SELECT * FROM User WHERE username = '${username}'`;
    const registerSQL = `INSERT INTO User (username, password) VALUES ('${username}','${encPass}')`;
    const createAPIkey = `INSERT INTO Apikey (userkey, username, stat) VALUES ('${apikey}','${username}',0)`;  

    if (!username || !encPass) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

    con.query(checkUser, (error, results, fields) => {
        console.log(results);
        if (error) {
            console.log('Error1');     
            res.status(500);
            return res.send({'error': 'Server error occurred'})      
        } else {       
            if (results.length > 0) {
                console.log('User already exists');
                res.status(204);
                return res.send({msg: 'Username already exists'});
            } else {
                con.query(registerSQL, (err, results2, field2) => {      
                    if (err) {
                        console.log('Error2');
                        res.status(500);
                        return res.send({'error': 'Server error occurred'})      
                    } else {
                        con.query(createAPIkey, (err3, results3, field3) => {
                            if (err3) {
                                console.log('Error3');
                                res.status(500);
                                return res.send({'error': 'Server error occurred'})      
                            } else {
                                console.log(`User ${username} registered`);
                                console.log(`User ${username} apikey: ${apikey}`);
                                req.session.loggedin = true;
                                req.session.username = username;
                                req.session.save();
                                console.log(req.session);
                                res.status(200);
                                return res.send({apikey: `${apikey}`});
                            }
                        })
                    }
                });  
            }      
        }   
    })
});

// Login user
app.post('/api/v1/login', cors(corsOptions), (req, res) => {   
    const username = req.body.username;
    const pass = req.body.password;
    console.log('login');
    console.log(req.body);

    const searchUserSQL = `SELECT password FROM User WHERE username = '${username}'`;  

    if (!username || !pass) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

    res.setHeader('Access-Control-Allow-Credentials', true);

    con.query(searchUserSQL, async (error, results, fields) => { 
        console.log(results);     
        if (error) { 
            console.log('server err');    
            res.status(500);
            return res.send({'error': 'Server error occurred'})      
        } else {       
            if (results.length > 0) {
                const comparePass = await bcrypt.compare(pass, results[0].password);
                if (comparePass) {
                    console.log(`User ${username} logged in`);
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.save();
                    res.status(200);
                    console.log(req.session);
                    if (username == process.env.admin) {
                        return res.send({msg: 'admin'});
                    } else {
                        return res.send({msg: 'User logged in successfully'});
                    }
                } else {
                    res.status(204);
                    return res.send({msg: 'Username and password do not match'});
                }
            } else {
                res.status(206);
                return res.send({msg: 'Username does not exist'});
            }     
        }    
    });  
});

// Logout
app.delete('/api/v1/logout', cors(corsOptions), (req, res) => {
    console.log('Attempt logout');
    if (req.session) {
        req.session.destroy( err => {
            if (err) {
                console.log("Error logging out");
                res.status(400);
                return res.send({ msg: 'Unable to log out'});
            } else {
                console.log('User logged out successfully');
                res.status(200);
                return res.send({ msg: 'User logged out successfully'});
            }
        })
    } else {
        return res.end();
    }
});

// GET - Retrieve all Workouts
app.get('/api/v1/workouts', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log("session and params");
    console.log(req.session);
    console.log(req.query);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.post('/api/v1/add_exercise', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.get('/api/v1/random', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.post('/api/v1/search_fletter/:fletter', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.get('/api/v1/search_name/:name', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.post('/api/v1/search_id/:id', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.get('/api/v1/category/:category', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.delete('/api/v1/delete/:name', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.put('/api/v1/update', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.get('/api/v1/sessions', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.post('/api/v1/add_session', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

    const name = req.body.name;
    const time = req.body.time;

    if (!name || !time) {
        res.status(400);
        return res.send({'error': 'Missing parameters'});
    }

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
app.delete('/api/v1/delete_session/:name', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }

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
app.put('/api/v1/update_session', cors(corsOptions), async (req, res) => {
    if (!req.session) {
        res.status(401);
        return res.send({msg: 'Must be logged in!'});
    }
    console.log(req.session);
    const acceptRequest = await auth(req.query.apikey);
    if (!acceptRequest && (req.query.apikey != process.env.masterkey)) {
        console.log('Unauthorized request; incorrect apikey.');
        res.status(401);
        return res.send({msg: 'Unauthorized request; incorrect apikey.'});
    }
    
    const name = req.body.name;
    const time = req.body.time;

    const updateSQL = `UPDATE Session SET time = '${time}' WHERE name = '${name}'`;
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

        if (result.affectedRows > 0) {
            console.log('Successfully updated database');
            res.status(200);
            return res.send({msg: 'PUT request successful'});
        }  else {
            res.status(204);
            return res.send({msg: 'Session name could not be found'});
        }

    })
});

// GET - Retrieve all API endpoint stats
app.get('/api/v1/admin', cors(corsOptions), async (req, res) => {
    console.log(req.session);
    // if ( !req.session || !req.session.username || !(await authenticateAdmin(req.session.username)) ) {
    //     res.status(401);
    //     return res.send({msg: 'Must be logged in to admin!'});
    // }

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

// Authenticate API key
const auth = (rcvKey) => {
    // console.log(username);
    console.log(rcvKey);
    return new Promise((resolve, reject) => {
        // let checkKey = `SELECT * FROM Apikey WHERE username = '${username}'`;
        let checkKey = `SELECT * FROM Apikey WHERE userkey = '${rcvKey}'`;
        console.log('auth');
        con.query(checkKey, (error, results, fields) => {
            console.log(results);
            if (error) {
                console.log('Error1');  
                reject(error);       
            } else {       
                // && (results[0].userkey == rcvKey)
                if (results.length > 0) {
                    resolve(true);
                }
            }
            resolve(false);
        })
    });
};

authenticateAdmin = (username) => {
    return new Promise(resolve => {
        resolve(username == process.env.admin);
    });
}

    // let createTable = "CREATE TABLE IF NOT EXISTS User (id INT AUTO_INCREMENT, username VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) UNIQUE NOT NULL, PRIMARY KEY (id))";
    // let createTable = "CREATE TABLE IF NOT EXISTS Apikey (id INT AUTO_INCREMENT, userkey VARCHAR(255), username VARCHAR(255) UNIQUE, stat INT, PRIMARY KEY (id), CONSTRAINT fk_has_user FOREIGN KEY(username) REFERENCES User(username))";
    // const checkUser = `SELECT * FROM User`;
    // let dropTable = `DROP TABLE Apikey`;
    // const checkStats = `SELECT * FROM Apikey`;
    // con.query(checkStats, (err, result, fields) => {
    //     console.log(result);
    //     if (err) {
    //         console.log(err);
    //         return res.sendStatus(503);
    //     }
    //     // console.log('apikey table created');
    //     console.log('apikey table');
    //     return res.send();
    // });

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

    // const createTableQuery = "CREATE TABLE IF NOT EXISTS Session (id INT AUTO_INCREMENT, name VARCHAR(255), time FLOAT, PRIMARY KEY (id))";

    // const createTableQuery = "CREATE TABLE IF NOT EXISTS ApiStats (id INT AUTO_INCREMENT, method VARCHAR(255), endpoint VARCHAR(255), requests INT, PRIMARY KEY (id))";