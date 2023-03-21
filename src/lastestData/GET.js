const arduino = require('../../arduino')
const pb = require('../../pocketbase')

function startTImestamp(){
    var date = new Date()
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime()
}

module.exports = async () => {
    const data = arduino.getLastestData()
    const resultList = await pb.collection('records').getList(1, 1, {
        sort: '-created',
        '$autoCancel': false
    })
    if(Date.parse(resultList.items[0].created) < startTImestamp()){
        pb.collection('records').create({ status: resultList.items[0].status })
    }
    resultList.items[0]['ppm'] = data.ppm
    return resultList.items[0]
}