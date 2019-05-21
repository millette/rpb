// self
import PouchDB from "./db.js"
// import { setMessage, $el, $add, appendToMain } from "./dom.js"
import { setMessage } from "./dom.js"
import { all, domStuff } from "./misc.js"

// globals
const DBNAME = 'oy' //  // mydb
const DB = new PouchDB(DBNAME)

// console.log('DB-keys', DB.name, Object.keys(DB))

const init = () => window.fetch('/initial-batch.json')
  .then((res) => res.json())
  .then(DB.bulkDocs)
  .then(all.bind(this, DB))
  .then(domStuff.bind(this, DB))

export { init, setMessage }
