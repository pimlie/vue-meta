import { isString } from '../../../src/shared/typeof'

export function createId(uniqueElements, data) {
  let isU
  for (const i in uniqueElements) {
    const conf = uniqueElements[i]

    const isS = isString(conf)
    if (isS && data[conf]) {
      return conf
    } else if (!isS) {
      isU = true
      let hid = ''
      for (const k in conf) {
        if (!data[k] || !(conf[k] === true || conf[k] === data[k])) {
          isU = false
          break
        } else {
          hid = `${hid}-${conf[k] === true ? k : data[k]}`
        }
      }

      if (isU) {
        return hid.substr(1)
      }
    }
  }

  return null
}
