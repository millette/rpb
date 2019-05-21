import PouchDB from "./db.js"
import { setMessage, $el, $add, appendToMain } from "./dom.js"
import makeDownload from "./download.js"

// constants
const UI_TIMEOUT = 50

// pouchdb utils
const all = (DB) => DB.allDocs({ include_docs: true })

const asEdit = (DB, pre, doc) => {
  const ta = $el('textarea', { rows: 10, innerHTML: JSON.stringify(doc, null, '  ') })
  ta.onkeydown = (ev) => {
    try {
      if (!(ev.ctrlKey && (ev.code === 'Enter'))) return
      const nDoc = JSON.parse(ev.target.value)
      if (nDoc._rev !== doc._rev) throw new Error('Do not modify the _rev field manually.')

      let willDelete
      const method = nDoc._id ? 'put' : 'post'

      if (doc._id && (nDoc._id !== doc._id)) {
        const buzz = window.confirm('Are you sure you want to create a new document by changing its id field?')
        if (!buzz) throw new Error('Cancelled after id field change.')
        const buzz2 = window.confirm('Also remove the original document?')
        delete nDoc._rev
        willDelete = buzz2
      }
      const p = [DB[method](nDoc)]
      if (willDelete) p.push(DB.remove(doc))
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
          setMessage('Saved')
        })
    } catch (e) {
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

const makeDetails = (DB, doc) => {
  const divEl = $el('div')
  const preEl = $el('pre', JSON.stringify(doc, null, '  '))
  $add(divEl, preEl)
  if (!Object.keys(doc).length) asEdit(DB, preEl, {})
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
      asEdit(DB, preEl, doc)
    }
  }))

  if (Object.keys(doc).length) $add(buttonsEl, $el('button', {
    innerText: 'delete',
    onclick: (ev) => {
      ev.preventDefault()
      setMessage(`DELETED ${doc._id}`)
      DB.remove(doc)
        .then(all.bind(this, DB))
        .then(makeDomDocs)
    }
  }))

  return $add(divEl, buttonsEl)
}

const domDoc = (DB, { doc }) => {
  const ed = !Object.keys(doc).length
  const summary = $el('summary', ed ? 'NEW-DOC' : (doc.name || doc.title || doc._id || 'NEW-DOC?'))
  if (ed) setTimeout(() => summary.click(), UI_TIMEOUT)
  return $add(
    $el('li', { 'data-key': doc._id }),
    $add(
      $add($el('details'), makeDetails(DB, doc)),
      summary
    )
  )
}

const makeDomDocs = (DB, { rows }) => {
  const gg = document.querySelector('#shown-docs')
  const ulEl = gg || $el('ul', { id: 'shown-docs' })
  if (gg) ulEl.innerText = ''
  const li = (el) => $add(ulEl, el)
  rows.map(domDoc.bind(this, DB)).forEach(li)
  return ulEl
}

const domStuff = (DB, rows) => {
  appendToMain(makeDomDocs(DB, rows))
  appendToMain(makeNav(DB))
  return PouchDB.allDbs().then((dbs) => `Available DBs: ${dbs.join(', ')}`)
}

const makeNav = (DB) => {
  const div = $el('div')
  const more = $el('p')

  $add(more, $el('button', {
    innerText: 'New Doc',
    onclick: (ev) => {
      ev.preventDefault()
      all(DB)
        .then(({ rows }) => ({ rows: [{ doc: {  } }, ...rows] }))
        .then(makeDomDocs.bind(this, DB))
    }
  }))

  $add(more, $el('button', {
    innerText: 'Refresh',
    onclick: (ev) => {
      ev.preventDefault()
      all(DB).then(makeDomDocs.bind(this, DB))
    }
  }))

  $add(more, $el('button', {
    innerText: 'Sync',
    onclick: (ev) => {
      ev.preventDefault()
      const dbName = window.prompt('DB name:')
      if (!dbName) return setMessage('Not synced, no db name given.')
      if (DB.name === dbName) return setMessage('Cannot sync to itself.')
      const db2 = new PouchDB(dbName)
      PouchDB.sync(DB, db2)
        .then((x) => {
          setMessage(`Synced with ${dbName}: ${JSON.stringify(x)}`)
          return all(DB)
        })
        .then(makeDomDocs.bind(this, DB))
        .catch(setMessage)
    }
  }))

  const nav = $el('ul', { id: 'exports' })
  const navA = $el('li')
  const navB = $el('li')
  $add(nav, $add(navA, makeDownload(DB, false)))
  $add(nav, $add(navB, makeDownload(DB, true)))
  $add(div, more)
  $add(div, nav)
  return div
}

export { all, domStuff, makeDomDocs }
