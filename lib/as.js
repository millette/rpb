import { setMessage, $el, $add } from "./dom.js"

// constants
const UI_TIMEOUT = 50

const asEdit = (DB, pre, doc) => {
  const ta = $el("textarea", {
    rows: 10,
    innerHTML: JSON.stringify(doc, null, "  "),
  })
  ta.onkeydown = (ev) => {
    try {
      if (!(ev.ctrlKey && ev.code === "Enter")) return
      const nDoc = JSON.parse(ev.target.value)
      if (nDoc._rev !== doc._rev)
        throw new Error("Do not modify the _rev field manually.")

      let willDelete
      const method = nDoc._id ? "put" : "post"

      if (doc._id && nDoc._id !== doc._id) {
        const buzz = window.confirm(
          "Are you sure you want to create a new document by changing its id field?"
        )
        if (!buzz) throw new Error("Cancelled after id field change.")
        const buzz2 = window.confirm("Also remove the original document?")
        delete nDoc._rev
        willDelete = buzz2
      }
      const p = [DB[method](nDoc)]
      if (willDelete) p.push(DB.remove(doc))
      Promise.all(p).then(([p0, p1]) => {
        if (!p0.ok) throw new Error("Put/Post error.")

        doc = {
          ...nDoc,
          _id: p0.id,
          _rev: p0.rev,
        }
        pre.innerText = JSON.stringify(doc, null, "  ")
        document.querySelectorAll("#exports > li > a").forEach((el) => {
          const { pathname, href } = el
          if (pathname) return
          el.href = "#"
          URL.revokeObjectURL(href)
        })
        if (p1 && !p1.ok) throw new Error("Put/Post error.")
        setMessage("Saved")
      })
    } catch (e) {
      setMessage(e.message)
    }
  }
  pre.innerText = ""
  $add(pre, ta)
  setTimeout(() => ta.focus(), UI_TIMEOUT)
}

const asRead = (pre, doc) => {
  pre.innerText = JSON.stringify(doc, null, "  ")
}

export { asEdit, asRead, UI_TIMEOUT }
