// npm
const PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-adapter-memory'))

const db = new PouchDB('mydb', {adapter: 'memory'})
console.log(db.adapter) // 'memory'

