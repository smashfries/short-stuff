const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

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