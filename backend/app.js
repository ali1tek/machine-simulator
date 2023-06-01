var createError = require('http-errors')
global.express = require('express')
var bodyParser = require('body-parser')
var logger = require('morgan')

var methodOverride = require('method-override')
var cookieParser = require('cookie-parser')
var app = express()
var cors = require('cors')
// global.restHelper=require('./rest-helper')

module.exports = () => new Promise((resolve, reject) => {
  app.use(cors())

  if (process.env.NODE_ENV === 'development'){
    app.use(logger('dev'))
  }

  app.use(bodyParser.json({ limit: "500mb" }))
  app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit: 50000 }))

  app.use(cookieParser())
  app.use(methodOverride())


  // app.use('/', express.static(path.join(__root, 'public')))
  //app.use('/docs', express.static(path.join(__root, 'docs')))

  // testControllers(true)
  // .then(() => {
  require('./rest-api/routes')(app)
  eventLog(`[RestAPI]`.cyan, 'started')
  resolve(app)
  // })
  // .catch(reject)
})



// /*
//   REST-API CONTROLLER TEST
//   Checking all controllers folders.
// */
// function testControllers(log) {
//   return util.moduleLoader(path.join(__dirname, '/controllers'), '.controller.js')
//     .then(() => { })
// }