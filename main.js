// npm
import PouchDB from 'pouchdb-core'
import memory from 'pouchdb-adapter-memory'
import idb from 'pouchdb-adapter-idb'
import mapreduce from "pouchdb-mapreduce"

PouchDB.plugin(idb).plugin(memory).plugin(mapreduce)

const adapter = 'idb'
const UI_TIMEOUT = 50
const db = new PouchDB('mydb', { adapter })

// dom utils
const mainEl = document.querySelector('main')
const errorEl = mainEl.querySelector('#error-message')
let errorTimer

const setMessage = (msg, ms = 5000) => {
  errorEl.innerText = msg || ''
  if (msg && ms) {
    clearTimeout(errorTimer)
    errorTimer = setTimeout(setMessage, ms)
  }
}

const $el = (tag, attr) => {
  const el = document.createElement(tag)
  if (!attr) return el
  if (typeof attr === 'string') attr = { innerText: attr }
  if (typeof attr !== 'object') throw new Error('Expected object or string (for .innerText).')
  let r
  for (r in attr) el[r] = attr[r]
  return el
}

const $add = (p, c) => p.appendChild(c) && p
const appendToMain = (c) => $add(mainEl, c)

// pouchdb utils
const all = () => db.allDocs({ include_docs: true })

const asEdit = (pre, doc) => {
  const ta = $el('textarea', { rows: 10, innerHTML: JSON.stringify(doc, null, '  ') })
  ta.onkeydown = (ev) => {
    try {
      if (!(ev.ctrlKey && (ev.code === 'Enter'))) return
      const nDoc = JSON.parse(ev.target.value)
      if (nDoc._rev !== doc._rev) throw new Error('Do not modify the _rev field manually.')

      let willDelete
      const method = nDoc._id ? 'put' : 'post'

      if (doc._id && (nDoc._id !== doc._id)) {
        const buzz = confirm('Are you sure you want to create a new document by changing its id field?')
        if (!buzz) throw new Error('Cancelled after id field change.')
        const buzz2 = confirm('Also remove the original document?')
        delete nDoc._rev
        willDelete = buzz2
      }
      const p = [db[method](nDoc)]
      if (willDelete) p.push(db.remove(doc))
      Promise.all(p)
        .then(([p0, p1]) => {
          if (!p0.ok) throw new Error('Put/Post error.')

          doc = {
            ...nDoc,
            _id: p0.id,
            _rev: p0.rev
          }
          pre.innerText = JSON.stringify(doc, null, '  ')
          document.querySelectorAll('#exports > li > a')
            .forEach((el) => {
              const { pathname, href } = el
              if (pathname) return
              el.href = '#'
              URL.revokeObjectURL(href)
            })
          if (p1 && !p1.ok) throw new Error('Put/Post error.')
          // errorEl.innerText = 'Saved'
          setMessage('Saved')
        })
    } catch (e) {
      console.error('OUILLE', e)
      // errorEl.innerText = e.message
      setMessage(e.message)
    }
  }
  pre.innerText = ''
  $add(pre, ta)
  setTimeout(() => ta.focus(), UI_TIMEOUT)
}

const asRead = (pre, doc) => {
  pre.innerText = JSON.stringify(doc, null, '  ')
}

const makeDetails = (doc) => {
  const divEl = $el('div')
  const preEl = $el('pre', JSON.stringify(doc, null, '  '))
  $add(divEl, preEl)
  if (!Object.keys(doc).length) asEdit(preEl, {})
  const buttonsEl = $el('div')

  $add(buttonsEl, $el('button', {
    innerText: 'show',
    onclick: (ev) => {
      ev.preventDefault()
      asRead(preEl, doc)
    }
  }))

  $add(buttonsEl, $el('button', {
    innerText: 'edit',
    onclick: (ev) => {
      ev.preventDefault()
      asEdit(preEl, doc)
    }
  }))

  $add(buttonsEl, $el('button', 'b2'))
  $add(buttonsEl, $el('button', 'b3'))
  return $add(divEl, buttonsEl)
}

const domDoc = ({ doc }) => {
  const ed = !Object.keys(doc).length
  const summary = $el('summary', ed ? 'NEW-DOC' : (doc.name || doc.title || doc._id || 'NEW-DOC?'))
  if (ed) setTimeout(() => summary.click(), UI_TIMEOUT)
  return $add(
    $el('li', { 'data-key': doc._id }),
    $add(
      $add($el('details'), makeDetails(doc)),
      summary
    )
  )
}

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
  const gg = document.querySelector('#shown-docs')
  const ulEl = gg || $el('ul', { id: 'shown-docs' })
  if (gg) ulEl.innerText = ''
  const li = (el) => $add(ulEl, el)
  rows.map(domDoc).forEach(li)
  return ulEl
}

const makeNav = () => {
  const div = $el('div')

  const more = $el('p')
  const but = $el('button', {
    innerText: 'New Doc',
    onclick: (ev) => {
      ev.preventDefault()
      all()
        .then(({ rows }) => ({ rows: [{ doc: {  } }, ...rows] }))
        .then(makeDomDocs)
    }
  })

  const but2 = $el('button', {
    innerText: 'Refresh',
    onclick: (ev) => {
      ev.preventDefault()
      all().then(makeDomDocs)
    }
  })

  $add(more, but)
  $add(more, but2)

  const nav = $el('ul', { id: 'exports' })
  const navA = $el('li')
  const navB = $el('li')
  $add(nav, $add(navA, makeDownload(false)))
  $add(nav, $add(navB, makeDownload(true)))
  $add(div, more)
  $add(div, nav)
  return div
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
    // errorEl.innerText = ''
    setMessage()
  })
  .catch((e) => {
    console.error('KARAMBA', e)
    // errorEl.innerText = e.message
    setMessage(e.message)
  })
