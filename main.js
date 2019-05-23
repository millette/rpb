// self
import { init, setMessage, defaultDBName } from "./lib/utils.js"

if (
  new URL(window.location.href).searchParams.get("db-name") === defaultDBName
) {
  window.location.href = "."
} else {
  init()
    .then(setMessage)
    .catch(setMessage)
}
