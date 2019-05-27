// npm
import PouchDB from "pouchdb-browser"
import allDbs from "pouchdb-all-dbs"

allDbs(PouchDB)

const all = (DB) => DB.allDocs({ include_docs: true })

export default PouchDB
export { all }
