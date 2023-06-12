/* eslint-disable indent */
import { regexForAdress } from '../../common-utils'

export function parseDataCapRemoval(trimmed) {
  const data = {
    url: 'Client Application URL or Application Number',
    name: "Client Name", //eslint-disable-line
    address: 'Client Address',
    datacapToRemove: 'Amount of DataCap to be removed',
  }

  const parsedData = {
    url: "",
    name: "",
    address: "",
    datacapToRemove: ""
  }

  for (const [k, v] of Object.entries(data)) {
    const rg = new RegExp(`(?<=${v})(.*?)(?=#)`)

    if (k == "datacapToRemove") {
      const reg = new RegExp(`${v}(.+)`)
      parsedData[k] = trimmed.match(reg) ? trimmed.match(reg)[1] : null
    } else {
      parsedData[k] = trimmed.match(rg) ? trimmed.match(rg)[0] : null
    }

    if (parsedData[k] === '_No response_') parsedData[k] = null
  }
  return parsedData
}
