// self
import { init, setMessage } from "./utils.js"

init()
  .then(setMessage)
  .catch(setMessage)
