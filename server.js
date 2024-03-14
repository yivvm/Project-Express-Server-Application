if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
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
const reviews = require('./data/reviews')

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


// GET the main.html
app.use(express.static('public'))
app.get('/main', (req, res) => {
    res.sendFile(__dirname + '/public/main.html')
})


// GET the default page: Schedule an appoitment
app.get('/', (req, res) => {
    res.render('index.ejs')
})

// GET the Login page
app.get('/login', (req, res) => {
    res.render('login.ejs')
})

// GET the register page
app.get('/register', (req, res) => {
    res.render('register.ejs')
})

// GET the review page
app.get('/review', (req, res) => {
    res.render('review.ejs')
})

// GET the Login page
app.get('/test', (req, res) => {
    res.render('test.ejs')
})

// GET all users at API endpoint
app.get('/api/users', (req, res) => {
    res.json(users)
})

// GET all visits at API endpoint
// app.get('/api/visits', (req, res) => {
//     res.json(visits)
// })

// GET visit by id at API endpoint
app.get('/api/visits/:id', (req, res, next) => {
    try {
        const visit = visits.find(v => v.id == req.params.id) 
        console.log(visit)
        if (visit) res.json(visit)
        next()
    } catch (err) {
        console.error(err)
    }
})

// GET all visits at API endpoints with optional query parameters for filtering
app.get('/api/visits', (req, res) => {
    let filteredVisits = [...visits]

    // console.log(filteredVisits)

    if (req.query.startDate && req.query.endDate) {
        const startDate = req.query.startDate
        const endDate = req.query.endDate

        console.log(startDate)
        console.log(endDate)

        filteredVisits = filteredVisits.filter(visit => {
            const visitDate = visit['scheduled date']
            console.log(visitDate)
            return visitDate >= startDate && visitDate <= endDate
        })
    }

    console.log(filteredVisits)
    res.json(filteredVisits)
})

// GET all reviews at API endpoint
app.get('/api/reviews', (req, res) => {
    res.json(reviews)
})


// Post - login
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


// POST - create a new user at the webpage by an end user, and update /api/users as well
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        if (req.body.email && req.body.password) {
            if (users.find(u => u.email == req.body.email)) {
                res.json({ error: 'Email already registered. Please log in.'})
                return
            }
            
            const filename = 'users'
            const newUser = {
                id: users[users.length - 1].id + 1,
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            }
            users.push(newUser)
            updateJSDataFile(users, filename)
            console.log(`new registered: `, newUser)
            res.redirect('/')
        }

    } catch {
        res.json({ error: "Insufficient Data"})
        res.redirect('/register')
    }
})


// POST - create a new visit at the website by an end user, and update /api/visits as well
app.post('/', (req, res) => {
    try {
        const filename = 'visits'
        const newVisit = {
            id: visits[visits.length - 1].id + 1,
            "scheduled date": req.body.scheduleddate,
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
        updateJSDataFile(visits, filename)
        console.log('new visit: ', newVisit)
        res.status(200).send('Your visit was scheduled successfully.')
    } catch {
        res.redirect('/register')
    }
})

function updateJSDataFile(inputs, filename) {
    const inputsJS = 'module.exports = ' + JSON.stringify(inputs, null, 4);
    fs.writeFile(`./data/${filename}.js`, inputsJS, (err) => {
        if (err) {
            console.error('Error writing to users.js:', err);
        } else {
            console.log('Users file updated successfully');
        }
    })
}


// POST - create a new review at the website by an end user, and update /api/reviews as well
app.post('/review', (req, res) => {
    try {
        const filename = 'reviews'
        const newReview = {
            id: (reviews.length === 0) ? 1 : reviews[reviews.length - 1].id + 1,
            review: req.body.review,
            score: req.body.score
        }
        reviews.push(newReview)
        updateJSDataFile(reviews, filename)
        console.log(`new review: `, newReview)
        res.status(200).send('Thank you for your review!')

    } catch {
        // res.redirect('/')
    }
})


// DELETE visit
app.delete('/api/visits/:id', (req, res, next) => {
    const visit = visits.find((v, i) => {
        if (v.id == req.params.id) {
            visits.splice(i, 1)
            return true
        }
    })
    
    if (visit) res.json(visit)
    else next() 
})

// DELETE review
app.delete('/api/reviews/:id', (req, res, next) => {
    const review = reviews.find((r, i) => {
        if (r.id == req.params.id) {
            reviews.splice(i, 1)
            return true
        }
    })

    if (review) res.json(review)
    next()
})


app.use((req, res) => {
    res.status(404)
    res.json({ error: 'resource not found '})
})

app.listen(3001, () => {
    console.log(`server running on port 3001`)
})