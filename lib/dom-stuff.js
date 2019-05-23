import PouchDB, { all } from "./db.js"
import { setMessage, $el, $add, appendToMain } from "./dom.js"
import makeDownload from "./download.js"
import makeDomDocs from "./dom-docs.js"

const actionEl = document.querySelector("#app-action")

const clicky = (DB, ev) => synchem(DB, ev.target.innerText)

const nevermind = (ev) => {
  ev.preventDefault()
  actionEl.innerText = ""
  return setMessage("Sync cancelled.")
}

const synchem = (DB, dbName) => {
  if (!dbName) {
    actionEl.innerText = ""
    return setMessage("Sync cancelled.")
  }

  if (DB.name === dbName) {
    actionEl.innerText = ""
    return setMessage("Cannot sync to itself.")
  }

  const db2 = new PouchDB(dbName)
  PouchDB.sync(DB, db2)
    .then((x) => {
      setMessage(`Synced with ${dbName}: ${JSON.stringify(x)}`)
      actionEl.innerText = ""
      return all(DB)
    })
    .then(makeDomDocs.bind(this, DB))
    .catch((e) => {
      actionEl.innerText = ""
      setMessage(e)
    })
}

const syncer = (DB, ev) => {
  ev.preventDefault()
  const dd = new window.FormData(ev.target)
  synchem(DB, dd.get("db-name"))
}

const currentDb = (DB) =>
  $el("h3", DB && DB.name ? `Current DB: ${DB.name}` : "No DB selected")

const domStuff = (DB, rows) => {
  appendToMain(currentDb(DB))

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

        return PouchDB.allDbs().then((dbs) => {
          const otherDbs = dbs.filter((d) => d !== DB.name)
          actionEl.innerText = ""
          const div = $el("div")
          $add(div, $el("h3", "Sync with..."))
          const frm = $el("form", { onsubmit: syncer.bind(this, DB) })
          if (otherDbs.length) {
            const div2 = $el("div")
            $add(div2, $el("h4", "Known DBs"))
            otherDbs.map((d) => {
              $add(
                div2,
                $el("button", {
                  onclick: clicky.bind(this, DB),
                  innerText: d,
                })
              )
            })
            $add(frm, div2)
          }
          const lbl = $el("label", "New: ")
          $add(lbl, $el("input", { type: "text", name: "db-name" }))
          $add(frm, lbl)
          $add(frm, $el("input", { type: "submit" }))
          $add(
            frm,
            $el("button", {
              onclick: nevermind,
              innerText: "Cancel",
            })
          )
          $add(div, frm)
          $add(actionEl, div)
        })
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
