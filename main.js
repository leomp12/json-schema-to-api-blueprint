let str = ''

function strX (str, json, spaces) {
  let x = {}
  Object.assign(x, json.properties, json.patternProperties)
  let req = json.required

  for (let prop in x) {
    if (x.hasOwnProperty(prop)) {
      let type = x[prop].type
      let description = x[prop].description
      switch (type) {
        case 'integer':
          type = 'number'
          break

        case 'string':
          if (x[prop].hasOwnProperty('enum')) {
            type = 'enum'
          }
          break

        case 'array':
          if (x[prop].hasOwnProperty('minItems')) {
            description += ' - Min number of elements: **' + x[prop].minItems + '**'
          }
          if (x[prop].hasOwnProperty('maxItems')) {
            description += ' - Max number of elements: **' + x[prop].maxItems + '**'
          }
          break

        case 'object':
          if (x[prop].hasOwnProperty('minProperties')) {
            description += ' - Min number of properties: **' + x[prop].minProperties + '**'
          }
          if (x[prop].hasOwnProperty('maxProperties')) {
            description += ' - Max number of properties: **' + x[prop].maxProperties + '**'
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
            str += spaces + '    + ' + x[prop].enum[i] + ' (string)\n'
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
              if (items.type.hasOwnProperty('enum')) {
                items.type = 'enum'
              }
              break
          }
          str += spaces + '    + (' + items.type + ') - ' + items.description + '\n'

          switch (items.type) {
            case 'enum':
              for (let i = 0; i < items.enum.length; i++) {
                str += spaces + '        + ' + items.enum[i] + ' (string)\n'
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
