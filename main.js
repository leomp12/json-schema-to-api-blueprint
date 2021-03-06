let json = {}

let str = ''

function escapeStr (str) {
  if (str !== undefined) {
    return str.replace(/(([\w-]+)?(_|\+|\*)([\w-]+)?)/g, '`$1`')
  } else {
    return ''
  }
}

function strX (str, json, spaces) {
  let x = {}
  Object.assign(x, json.properties, json.patternProperties)
  let req = json.required

  for (let prop in x) {
    if (x.hasOwnProperty(prop)) {
      let type = x[prop].type
      if (Array.isArray(type)) {
        type = type[0]
      }
      let description = escapeStr(x[prop].description)
      switch (type) {
        case 'integer':
        case 'number':
          type = 'number'
          if (x[prop].hasOwnProperty('minimum')) {
            description += ' - Mininum: **' + x[prop].minimum + '**'
          }
          if (x[prop].hasOwnProperty('maximum')) {
            description += ' - Maximum: **' + x[prop].maximum + '**'
          }
          if (x[prop].hasOwnProperty('multipleOf')) {
            description += ' - Max precision: **' + x[prop].multipleOf + '**'
          }
          break

        case 'string':
          if (x[prop].hasOwnProperty('enum')) {
            type = 'enum'
          } else {
            if (x[prop].hasOwnProperty('minLength')) {
              description += ' - Min length: **' + x[prop].minLength + '**'
            }
            if (x[prop].hasOwnProperty('maxLength')) {
              description += ' - Max length: **' + x[prop].maxLength + '**'
            }
            if (x[prop].hasOwnProperty('format')) {
              description += ' - Format: **' + x[prop].format + '**'
            } else if (x[prop].hasOwnProperty('pattern')) {
              description += ' - RegEx pattern: **`' + x[prop].pattern + '`**'
            }
          }
          break

        case 'array':
          if (x[prop].hasOwnProperty('minItems')) {
            description += ' - Min elements: **' + x[prop].minItems + '**'
          }
          if (x[prop].hasOwnProperty('maxItems')) {
            description += ' - Max elements: **' + x[prop].maxItems + '**'
          }
          break

        case 'object':
          if (x[prop].hasOwnProperty('minProperties')) {
            description += ' - Min properties: **' + x[prop].minProperties + '**'
          }
          if (x[prop].hasOwnProperty('maxProperties')) {
            description += ' - Max properties: **' + x[prop].maxProperties + '**'
          }
          break
      }

      str += spaces + '+ `' + prop + '`'
      if (x[prop].hasOwnProperty('default')) {
        str += ': ' + x[prop].default
      }
      str += ' (' + type
      if (Array.isArray(req)) {
        for (let i = 0; i < req.length; i++) {
          if (prop === req[i]) {
            str += ', required'
            break
          }
        }
      }
      str += ') - ' + description + '\n'

      switch (type) {
        case 'enum':
          for (let i = 0; i < x[prop].enum.length; i++) {
            str += spaces + '    + `' + x[prop].enum[i] + '` (string)\n'
          }
          break

        case 'object':
          str = strX(str, x[prop], spaces + '    ')
          break

        case 'array':
          let items = x[prop].items

          switch (items.type) {
            case 'integer':
              items.type = 'number'
              break

            case 'string':
              if (items.hasOwnProperty('enum')) {
                items.type = 'enum'
              }
              break
          }
          str += spaces + '    + (' + items.type + ') - ' + escapeStr(items.description) + '\n'

          switch (items.type) {
            case 'enum':
              for (let i = 0; i < items.enum.length; i++) {
                str += spaces + '        + `' + items.enum[i] + '` (string)\n'
              }
              break

            case 'object':
              str = strX(str, items, spaces + '        ')
              break
          }
          break
      }
    }
  }

  return str
}

str = strX(str, json, '')
// console.log(str)
