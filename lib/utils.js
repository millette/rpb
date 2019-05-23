// self
import PouchDB, { all } from "./db.js"
import { setMessage } from "./dom.js"
import domStuff from "./dom-stuff.js"

// globals
const defaultDBName = "demo"
const DB = new PouchDB(
  new URL(window.location.href).searchParams.get("db-name") || defaultDBName
)

document.querySelector("#initial-batch").href = "initial-batch.json"

const init = () =>
  (DB.name === defaultDBName
    ? window
        .fetch("initial-batch.json")
        .then((res) => res.json())
        .then(DB.bulkDocs)
        .then(all.bind(this, DB))
    : all(DB)
  ).then(domStuff.bind(this, DB))

export { init, setMessage, defaultDBName }
