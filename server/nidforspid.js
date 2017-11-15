const randomArrayItem = require('./randomArrayItem')

module.exports = template =>
  Object.keys(template)
    .map(words => randomArrayItem(template[words]))
    .join(' ')
