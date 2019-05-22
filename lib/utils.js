// self
import PouchDB, { all } from "./db.js"
import { setMessage } from "./dom.js"
import domStuff from "./dom-stuff.js"

// globals
const DBNAME = "mydb" // oy
const DB = new PouchDB(DBNAME)

const init = () =>
  window
    .fetch("initial-batch.json")
    .then((res) => res.json())
    .then(DB.bulkDocs)
    .then(all.bind(this, DB))
    .then(domStuff.bind(this, DB))

export { init, setMessage }
