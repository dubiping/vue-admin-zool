const setting = require('./setting.config')
const network = require('./net.config')
const theme = require('./theme.config')

module.exports = Object.assign({}, setting, network, theme)
