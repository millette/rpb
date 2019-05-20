// npm
import PouchDB from 'pouchdb-core'
import memory from 'pouchdb-adapter-memory'

PouchDB.plugin(memory)

const db = new PouchDB('mydb', {adapter: 'memory'})

// dom utils
const mainEl = document.querySelector('main')
const $el = (tag, attr = {}) => {
  const el = document.createElement(tag)
  let r
  for (r in attr) el[r] = attr[r]
  return el
}

const $add = (p, c) => p.appendChild(c) && p
const appendToMain = (c) => $add(mainEl, c)

// pouchdb utils
const all = () => db.allDocs({ include_docs: true })

const makeDetails = (doc) => $el('pre', { innerText: JSON.stringify(doc, null, '  ') })

const domDoc = ({ doc }) => $add(
  $el('li'),
  $add(
    $add($el('details'), makeDetails(doc)),
    $el('summary', { innerText: doc.name || doc.title || doc._id })
  )
)

const download = function (withRevs, { rows }) {
  const mdoc = withRevs ? (({doc}) => doc) : (({doc}) => ({ ...doc, _rev: undefined }))
  const blob = new Blob([JSON.stringify(rows.map(mdoc))], { type: "application/json" })
  this.href = URL.createObjectURL(blob)
  this.click()
}

const makeDownload = (withRev) => $el('a', {
  href: '#',
  target: '_blank',
  innerText: `Export with${withRev ? '' : 'out'} revs`,
  onclick: function (ev) {
    if (!this.pathname) return
    ev.preventDefault()
    all().then(download.bind(this, withRev))
  }
})

const makeDomDocs = ({ rows }) => {
  const ulEl = $el('ul')
  const li = (el) => $add(ulEl, el)
  rows.map(domDoc).forEach(li)
  return ulEl
}

const makeNav = () => {
  const nav = $el('ul')
  const navA = $el('li')
  const navB = $el('li')
  $add(nav, $add(navA, makeDownload(false)))
  $add(nav, $add(navB, makeDownload(true)))
  return nav
}

const domStuff = (rows) => {
  appendToMain(makeDomDocs(rows))
  appendToMain(makeNav())
  return 'All DOM!'
}

const init = () => fetch('/initial-batch.json')
  .then((res) => res.json())
  .then(db.bulkDocs)
  .then(all)
  .then(domStuff)

init()
  .then((x) => {
    console.log(x)
  })
  .catch((e) => {
    console.error(e)
  })
