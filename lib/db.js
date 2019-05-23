// npm
import PouchDB from "pouchdb-browser"
import allDBs from "pouchdb-all-dbs"

allDBs(PouchDB)

const all = (DB) =>
  DB ? DB.allDocs({ include_docs: true }) : Promise.resolve({ rows: [] })

export default PouchDB
export { all }
