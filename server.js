if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const fs = require('fs')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = require('./data/users')
const visits = require('./data/visits')
const bodyParser = require('body-parser')

// app.use(express.static('public'))

app.set('view-engine', 'ejs')
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ extended: true }))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// GET the main page: Schedule an appoitment
app.get('/', (req, res) => {
    res.render('index.ejs')
})

// GET the Login page
app.get('/login', (req, res) => {
    res.render('login.ejs')
})

// Post - login
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


// GET all users
app.get('/api/users', (req, res) => {
    res.json(users)
})

// GET the register page
app.get('/register', (req, res) => {
    res.render('register.ejs')
})



// POST - API endpoint - add a new user 
app.post('/api/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        if (req.body.email && req.body.password) {
            if (users.find(u => u.email == req.body.email)) {
                res.json({ error: 'Email already registered. Please log in.'})
                return
            }
            
            const newUser = {
                id: users[users.length - 1].id + 1,
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            }

            users.push(newUser)

            // Append new user to users.js
            const usersJS = 'module.exports = ' + JSON.stringify(users, null, 4)
            fs.writeFile('./data/users.js', usersJS, (err) => {
                if (err) {
                    console.error('error writing to users.js: ', err)
                    res.status(500).json({ error: 'internal server error' })
                    return
                }

                console.log('New user added via API: ', newUser)
                res.json(newUser)
                })
        }
    } catch {

    }
})

// POST - create a new user at the webpage by an end user
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        if (req.body.email && req.body.password) {
            if (users.find(u => u.email == req.body.email)) {
                res.json({ error: 'Email already registered. Please log in.'})
                return
            }
            
            const newUser = {
                id: users[users.length - 1].id + 1,
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            }
            users.push(newUser)
            updateUsersFile(users)
            console.log(`new registered: `, newUser)
            res.redirect('/')
        }

    } catch {
        res.json({ error: "Insufficient Data"})
        res.redirect('/register')
    }
})

// POST - create a new visit
app.post('/', (req, res) => {
    try {
        const newVisit = {
            id: Date.now().toString(),
            "schdueled date": req.body.scheduleddate,
            time: req.body.time,
            "first name": req.body.firstname,
            "last name": req.body.lastname,
            "date of birth": req.body.dateofbirth,
            "gender": req.body.gender,
            "phone": req.body.phone,
            "email": req.body.email,
            "reason": req.body.reason,
            "other": req.body.other
        }
        visits.push(newVisit)
        console.log('new visit: ', newVisit)
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

function updateUsersFile(users) {
    const usersJS = 'module.exports = ' + JSON.stringify(users, null, 4);
    fs.writeFile('./data/users.js', usersJS, (err) => {
        if (err) {
            console.error('Error writing to users.js:', err);
        } else {
            console.log('Users file updated successfully');
        }
    })
}

app.delete('/logout', (req, res) => {
    req.logOut()
    req.redirect('/')
})


app.listen(3001, () => {
    console.log(`server running on port 3001`)
})