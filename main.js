// npm
import PouchDB from 'pouchdb-core'
import memory from 'pouchdb-adapter-memory'

PouchDB.plugin(memory)

const db = new PouchDB('mydb', {adapter: 'memory'})
console.log(db.adapter) // 'memory'

const mainEl = document.querySelector('main')

fetch('/initial-batch.json')
  .then((res) => res.json())
  .then(db.bulkDocs)
  .then((json) => {
    const ulEl = document.createElement('ul')
    mainEl.appendChild(ulEl)
    console.log('JSON-0', json)
    const [{ id }] = json

    const liEl = document.createElement('li')
    liEl.innerText = id
    ulEl.appendChild(liEl)

    return Promise.all([liEl, db.get(id)])
  })
  .then(([liEl, json]) => {
    console.log('JSON-1', json)
    const preEl = document.createElement('pre')
    preEl.innerText = JSON.stringify(json, null, '  ')
    liEl.innerText = ''
    liEl.appendChild(preEl)
  })
