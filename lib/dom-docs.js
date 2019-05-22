import { all } from "./db.js"
import { setMessage, $el, $add } from "./dom.js"
import { asEdit, asRead, UI_TIMEOUT } from "./as.js"

const makeDetails = (DB, doc) => {
  const divEl = $el("div")
  const preEl = $el("pre", JSON.stringify(doc, null, "  "))
  $add(divEl, preEl)
  if (!Object.keys(doc).length) asEdit(DB, preEl, {})
  const buttonsEl = $el("div")

  $add(
    buttonsEl,
    $el("button", {
      innerText: "show",
      onclick: (ev) => {
        ev.preventDefault()
        asRead(preEl, doc)
      },
    })
  )

  $add(
    buttonsEl,
    $el("button", {
      innerText: "edit",
      onclick: (ev) => {
        ev.preventDefault()
        asEdit(DB, preEl, doc)
      },
    })
  )

  if (Object.keys(doc).length)
    $add(
      buttonsEl,
      $el("button", {
        innerText: "delete",
        onclick: (ev) => {
          ev.preventDefault()
          setMessage(`DELETED ${doc._id}`)
          DB.remove(doc)
            .then(all.bind(this, DB))
            .then(makeDomDocs)
        },
      })
    )

  return $add(divEl, buttonsEl)
}

const domDoc = (DB, { doc }) => {
  const ed = !Object.keys(doc).length
  const summary = $el(
    "summary",
    ed ? "NEW-DOC" : doc.name || doc.title || doc._id || "NEW-DOC?"
  )
  if (ed) setTimeout(() => summary.click(), UI_TIMEOUT)
  return $add(
    $el("li", { "data-key": doc._id }),
    $add($add($el("details"), makeDetails(DB, doc)), summary)
  )
}

const makeDomDocs = (DB, { rows }) => {
  const gg = document.querySelector("#shown-docs")
  const ulEl = gg || $el("ul", { id: "shown-docs" })
  if (gg) ulEl.innerText = ""
  const li = (el) => $add(ulEl, el)
  rows.map(domDoc.bind(this, DB)).forEach(li)
  return ulEl
}

export default makeDomDocs
