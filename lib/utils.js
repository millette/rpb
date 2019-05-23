// self
import PouchDB, { all } from "./db.js"
import { setMessage } from "./dom.js"
import domStuff from "./dom-stuff.js"

// globals
const where = new URL(window.location.href).searchParams.get("db-name")
const defaultDBName = "rpb"

let DB
if (where === defaultDBName) {
  window.location.href = "."
} else {
  DB = new PouchDB(where || defaultDBName)
}

const init = () =>
  (DB && DB.name === defaultDBName
    ? window
        .fetch("initial-batch.json")
        .then((res) => res.json())
        .then(DB.bulkDocs)
        .then(all.bind(this, DB))
    : all(DB)
  ).then(domStuff.bind(this, DB))

export { init, setMessage }
