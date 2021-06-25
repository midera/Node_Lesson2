const express = require('express');
const expressHandleB = require('express-handlebars');
const path = require('path');
const fsP = require('fs').promises;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'views')));

app.set('view engine', '.hbs');
app.engine('.hbs', expressHandleB({defaultLayout: false}));
app.set('views', path.join(__dirname, 'views'));

app.listen(3000, () => {
    console.log('server work');
});

app.get('/users', ((req, res) => {
    getUsers().then(value => {
        res.render('users', {value});
    });
}));

app.get('/', ((req, res) => {
    res.render('registr');
}));
app.post('/', ((req, res) => {

    addUserEmail(req.body).then(() => {
        res.redirect('/users');
    }).catch(() => {
        res.status(500).json('error');
    });
}));
app.get('/login', ((req, res) => {
    res.render('login');
}));

app.post('/login', ((req, res) => {
    const {password, email} = req.body;
    login(email, password).then(value => {
        res.render('user', {value});
    }).catch((value) => {
        value('/error');
    });
}));

app.get('/users/:id', ((req, res) => {
    getUserId(req.params.id).then(value => {
        res.render('user', {value});
    }).catch(value => {
        value('/error');
    });
}));

app.get('/error', (req, res) => {
    const {message} = req.session;
    res.render('error', {message});
});

async function getUsers() {
    try {
        const data = await fsP.readFile(path.join(__dirname, 'users.json'));
        return JSON.parse(data.toString());
    } catch (err) {
        console.log(err);
    }
}

async function addUserEmail(newUser) {
    try {
        const allUsers = await getUsers();
        return new Promise((resolve, reject) => {
            const result = allUsers.some(user => user.email === newUser.email);
            if (!result) {
                newUser.id = allUsers.length + 1;
                allUsers.push(newUser);
                fsP.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(allUsers));
                resolve('correct');
            } else reject('ATTENTION');
        });
    } catch (err) {
        console.log(err);
    }
}

async function login(email, password) {
    try {
        const allUsers = await getUsers();
        return new Promise((resolve, reject) => {
            const result = allUsers.some(user => user.email === email && user.password === password);
            if (result) {
                const userResult = allUsers.filter(value => value.email === email);
                resolve(userResult);
            } else reject('registration or sing up');
        });
    } catch (e) {
        console.log(e);
    }
}

async function getUserId(id) {
    try {
        const users = await getUsers();
        return new Promise((resolve, reject) => {
            const result = users.some(user => +user.id === +id);
            if (result) {
                const userResult = users.filter(user => user.id === id);
                resolve(userResult);
            } else reject('user  undefined');
        });
    } catch (err) {
        console.log(err);
    }
}