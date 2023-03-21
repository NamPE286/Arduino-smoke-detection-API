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

module.exports = async () => {
    var date = new Date()
    date.setUTCHours(0, 0, 0, 0);
    var timestamp = date.getTime() - 8640000000
    date = new Date(timestamp)
    const resultList = await pb.collection('records').getList(1, 50000, {
        filter: `created >= "${date.getFullYear()}-${getMonth(date)}-${getDate(date)} 00:00:00"`,
        '$autoCancel': false
    });
    var status = [0]
    var curTimestamp = timestamp + 2*86400000
    for (const i of resultList.items) {
        var itemTimestamp = Date.parse(i.created)
        while (itemTimestamp > curTimestamp) {
            status.push(0)
            curTimestamp += 86400000
        }
        status[status.length - 1] = Math.max(
            status[status.length - 1],
            i.status
        )
    }
    while (status.length < 100) status.push(-1)

    return status
}