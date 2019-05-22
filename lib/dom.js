// dom utils
const mainEl = document.querySelector("main")

const setMessage = (() => {
  const errorEl = document.querySelector("#error-message")
  let errorTimer

  return (msg, ms = 5000) => {
    errorEl.innerText = msg || ""
    if (msg && ms) {
      clearTimeout(errorTimer)
      errorTimer = setTimeout(setMessage, ms)
    }
  }
})()

const $el = (tag, attr) => {
  const el = document.createElement(tag)
  if (!attr) return el
  if (typeof attr === "string") attr = { innerText: attr }
  if (typeof attr !== "object")
    throw new Error("Expected object or string (for .innerText).")
  let r
  for (r in attr) el[r] = attr[r]
  return el
}

const $add = (p, c) => p.appendChild(c) && p
const appendToMain = (c) => $add(mainEl, c)

export { setMessage, $el, $add, appendToMain }
