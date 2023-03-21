const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const sendEmail = require('./sendEmail')
const pb = require('./pocketbase')

var initialized = false
var lastestData = {
    status: -1,
    ppm: -1
}

function parseSerialJSON(data) {
    const a = data.split('|')
    const status = a[1][0]
    const content = a[0]
    if (status == '0') return {
        status: 0,
        ppm: parseFloat(content)
    }
    if (status == '1') return {
        status: 1,
        message: content
    }
    if (status == '2') return {
        status: 2,
        message: content
    }
}

function getState(ppm) {
    if (ppm > 400) return 2
    if (ppm > 200) return 1
    return 0
}

function compareData(prevData, curData) {
    var prevState = getState(prevData.ppm)
    var curState = getState(curData.ppm)
    if (prevData.status == -1) return
    if (prevState != curState) {
        console.log(`Update state from ${prevState} to ${curState}`)
        pb.collection('records').create({ status: curState })
        sendEmail(curState)
    }
}

function updateLastestData(data) {
    compareData(lastestData, data)
    lastestData = data
}

module.exports = {
    init: (path, baudRate) => {
        if (initialized) return
        const arduinoPort = new SerialPort({ baudRate: baudRate, path: path });
        const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));
        arduinoPort.on('error', function (err) {
            console.log(err);
        });
        arduinoPort.on('open', () => {
            console.log('Arduino serial port initialized');
            initialized = true
        });
        parser.on('data', (data) => {
            const parsedData = parseSerialJSON(data)
            updateLastestData(parsedData)
        });

    },
    getLastestData: () => {
        return lastestData
    },
    getPPM: () => {
        if (!lastestData) return null
        if (lastestData.status != 0) return null
        return lastestData.ppm
    },
    isInitialized: () => {
        return initialized
    },
    updateLastestData: updateLastestData,
    compareData: compareData,
    parseSerialJSON: parseSerialJSON
}