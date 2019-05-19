// npm
import PouchDB from 'pouchdb-core'
import memory from 'pouchdb-adapter-memory'

PouchDB.plugin(memory)

const db = new PouchDB('mydb', {adapter: 'memory'})
console.log(db.adapter) // 'memory'

