// self
import { init, setMessage } from "./lib/utils.js"

init()
  .then(setMessage)
  .catch(setMessage)
