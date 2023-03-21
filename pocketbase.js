require('dotenv').config()
const PocketBase = require('pocketbase/cjs')
const pb = new PocketBase(process.env.POCKETBASE_API_URL)

console.log('Logging in to Pocketbase...')
pb.admins.authWithPassword(process.env.POCKETBASE_API_ADMIN_EMAIL, process.env.POCKETBASE_API_ADMIN_PASSWORD)
    .then((data) => {
        console.log(`Logged in as ${data.admin.email}`)
    })

module.exports = pb