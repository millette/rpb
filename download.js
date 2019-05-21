import { $el } from "./dom.js"
import { all } from "./misc.js"

const download = function(withRevs, { rows }) {
  const mdoc = withRevs
    ? ({ doc }) => doc
    : ({ doc }) => ({ ...doc, _rev: undefined })
  const blob = new window.Blob([JSON.stringify(rows.map(mdoc))], {
    type: "application/json",
  })
  this.href = URL.createObjectURL(blob)
  this.click()
}

const makeDownload = (DB, withRev) =>
  $el("a", {
    href: "#",
    target: "_blank",
    innerText: `Export with${withRev ? "" : "out"} revs`,
    onclick: function(ev) {
      if (!this.pathname) return
      ev.preventDefault()
      all(DB).then(download.bind(this, withRev))
    },
  })

export default makeDownload
