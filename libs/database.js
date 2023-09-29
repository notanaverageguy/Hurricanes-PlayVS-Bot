const PocketBase = require('pocketbase/cjs')

module.exports = {
    db: new PocketBase('http://127.0.0.1:8090')
}