const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')

const app = express()
app.use(bodyParser.json())
app.set('view engine', 'ejs')


app.get('/', (req, res) => {
    res.render('pages/index')
})

app.post('/shorten', (req, res) => {
    if (req.body.url) {
        res.send({
            originalURL: req.body.url,
            shortenedURL: 'https://go.gl/',
            code: 200
        })
    } else {
        res.send({
            message: 'Incorrect request',
            code: 400
        })
    }
})

app.listen(3000, () => {
    console.log('App running on port 3000')
})