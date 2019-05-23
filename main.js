// self
import { init, setMessage, defaultDBName } from "./lib/utils.js"

const where = new URL(window.location.href).searchParams.get("db-name")

if (where === defaultDBName) return (window.location.href = ".")

init()
  .then(setMessage)
  .catch(setMessage)
