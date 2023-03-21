require('dotenv').config()
const express = require('express')
const cors = require('cors')
const arduino = require('./arduino')
const pb = require('./pocketbase')

arduino.init(process.env.ARDUINO_PATH, parseInt(process.env.ARDUINO_PORT))

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    console.log('server ok')
    res.status(200).send({ message: 'server ok' })
})

app.get('/update/:data', (req, res) => {
    console.log(req.params.data)
    res.status(200).send({ message: 'received' })
})

app.get('/lastestData', async (req, res) => {
    const data = await require('./src/lastestData/GET')()
    res.status(200).send(data)
})

app.get('/100days', async (req, res) => {
    const data = await require('./src/100days/GET')()
    res.status(200).send(data)
})

app.get('/day/:timestamp', async (req, res) => {
    const data = await require('./src/day/GET')(parseInt(req.params.timestamp))
    res.status(200).send(data)
})

app.post('/data', (req, res) => {
    if (arduino.isInitialized()) {
        res.status(403)
        return
    }
    const data = arduino.parseSerialJSON(req.body.data)
    arduino.updateLastestData({ status: 0, ppm: parseInt(data) })
    res.status(200)
})

app.listen(
    process.env.PORT,
    () => {
        console.log(`Server is running on http://localhost:${process.env.PORT}`)
    }
)