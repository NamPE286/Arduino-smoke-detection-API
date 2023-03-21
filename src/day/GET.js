const pb = require('../../pocketbase')

function getMonth(date) {
    var month = String(date.getMonth() + 1)
    if (month.length == 1) return '0' + month
    return month
}

function getDate(date) {
    var day = String(date.getDate())
    if (day.length == 1) return '0' + day
    return day
}

function getDateString(date){
    return `${date.getFullYear()}-${getMonth(date)}-${getDate(date)} 00:00:00`
}

module.exports = async (timestamp) => {
    var start = new Date(timestamp)
    start.setUTCHours(0, 0, 0, 0);
    var end = new Date(start.getTime() + 86400000)
    const resultList = await pb.collection('records').getList(1, 50000, {
        filter: `created >= "${getDateString(start)}" && created <= "${getDateString(end)}"`,
        sort: '-created',
        '$autoCancel': false
    });
    return resultList
}