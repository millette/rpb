import PouchDB, { all } from "./db.js"
import { setMessage, $el, $add, appendToMain } from "./dom.js"
import makeDownload from "./download.js"
import makeDomDocs from "./dom-docs.js"

const domStuff = (DB, rows) => {
  appendToMain(makeDomDocs(DB, rows))
  appendToMain(makeNav(DB))
  return PouchDB.allDbs().then((dbs) => `Available DBs: ${dbs.join(", ")}`)
}

const makeNav = (DB) => {
  const div = $el("div")
  const more = $el("p")

  $add(
    more,
    $el("button", {
      innerText: "New Doc",
      onclick: (ev) => {
        ev.preventDefault()
        all(DB)
          .then(({ rows }) => ({ rows: [{ doc: {} }, ...rows] }))
          .then(makeDomDocs.bind(this, DB))
      },
    })
  )

  $add(
    more,
    $el("button", {
      innerText: "Refresh",
      onclick: (ev) => {
        ev.preventDefault()
        all(DB).then(makeDomDocs.bind(this, DB))
      },
    })
  )

  $add(
    more,
    $el("button", {
      innerText: "Sync",
      onclick: (ev) => {
        ev.preventDefault()
        const dbName = window.prompt("DB name:")
        if (!dbName) return setMessage("Not synced, no db name given.")
        if (DB.name === dbName) return setMessage("Cannot sync to itself.")
        const db2 = new PouchDB(dbName)
        PouchDB.sync(DB, db2)
          .then((x) => {
            setMessage(`Synced with ${dbName}: ${JSON.stringify(x)}`)
            return all(DB)
          })
          .then(makeDomDocs.bind(this, DB))
          .catch(setMessage)
      },
    })
  )

  const nav = $el("ul", { id: "exports" })
  const navA = $el("li")
  const navB = $el("li")
  $add(nav, $add(navA, makeDownload(DB, false)))
  $add(nav, $add(navB, makeDownload(DB, true)))
  $add(div, more)
  $add(div, nav)
  return div
}

export default domStuff
