// npm
import PouchDB from "pouchdb-browser"
import allDBs from "pouchdb-all-dbs"

allDBs(PouchDB)

const all = (DB) => DB.allDocs({ include_docs: true })

export default PouchDB
export { all }
