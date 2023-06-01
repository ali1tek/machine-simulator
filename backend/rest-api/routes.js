const packageJson = require(path.join(__root, 'package.json'))
const basePath = '/connector'
const apiWelcomeMessage = {
  message: `Welcome to ${packageJson.name || ''} API V1. Usage: ${basePath}/api/v1/:func/[:param1]/[:param2]/[:param3] . Methods: GET, POST, PUT, DELETE`,
  status: process.env.NODE_ENV || ''
}
const spamCheck=require(path.join(__root,'lib/spamdetector'))

module.exports = async (app) => {

  app.all('/*', function (req, res, next) {
    next()
  })
  app.use(`${basePath}/docs`, express.static(path.join(__root, 'docs')))
  app.all(`${basePath}/api`, function (req, res) {
    res.status(200).json({ success: true, data: apiWelcomeMessage })
  })

  app.all(`${basePath}/api/v1`, function (req, res) {
    res.status(200).json({ success: true, data: apiWelcomeMessage })
  })

  app.all(`${basePath}`, function (req, res) {
    res.status(200).json({ success: true, data: 'Welcome to connector rest api. Usage: /connector/:func/[:param1]/[:param2]/[:param3] Methods: GET, POST, PUT, DELETE ' })
  })
  clientControllers(app, `${basePath}/api/v1/:func/:param1/:param2/:param3`)

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    res.status(404).json({ success: false, error: { name: '404', message: 'function not found..' } })
  })

  app.use((err, req, res, next) => {
    responseError(err, res)
  })
}


function clientControllers(app, route) {
  setRoutes(app, route, async (req, res, next) => {

    let ctl = getController('connector-controllers', req.params.func)
    if (ctl) {
      clientPassport(req)
        .then(connector => {
          let params = {}
          Object.assign(params, req.body || {}, req.query || {})
          try {
            ctl(connector, params, req)
              .then(data => {
                if (data === undefined)
                  res.json({ success: true })
                else if (data === null)
                  res.json({ success: true })
                else {
                  res.status(200).json({ success: true, data: data })
                }
              })
              .catch(err => global.responseError(err, res))
          } catch (err) {
            global.responseError(err, res)
          }
        })
        .catch(err => global.responseError(err, res))
    } else {
      res.status(404).json({ success: false, error: { name: '404', message: 'function not found.' } })
    }

  })

}


function clientPassport(req) {
  return new Promise(async (resolve, reject) => {
    let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''
    let isSpam = spamCheck(IP)
    if (isSpam) {
      reject({ name: 'SPAM', message: `Your request has been detected as spam. Try again after ${Math.ceil(isSpam / 60)} minutes later.` })
    } else {
      let clientId = req.headers.clientid || req.headers.clientId || req.body.clientId || req.query.clientId || ''
      let clientPass = req.headers.clientpass || req.headers.clientPass || req.body.clientPass || req.query.clientPass || ''
      if (clientId && clientPass) {
        db.connectors.findOne({ clientId: clientId, clientPass: clientPass })
          .then(connDoc => {
            if (connDoc == null) {
              if (spamCheck(IP)) {
                reject({ name: 'SPAM', message: `Your request was detected as spam. After 60 minutes, try again` })
              } else {
                reject({ name: 'AUTH', message: `Connector Authentication failed.` })
              }
            } else {
              if (global.wss.socketListByClientId[connDoc.clientId]) {
                let connector = connDoc.toJSON()
                connector.socket = global.wss.socketListByClientId[connDoc.clientId]
                resolve(connector)
              } else {
                reject({ name: 'OFFLINE', message: 'Connector is not active now.' })
              }
            }
          })
          .catch(reject)
      } else {
        if (spamCheck(IP)) {
          reject({ name: 'SPAM', message: `Your request was detected as spam. After 60 minutes, try again` })
        } else {
          reject({ name: 'AUTH', message: `Connector Authentication failed.` })
        }
      }
    }
  })
}


function getController(folder, funcName) {
  let controllerName = path.join(__dirname, folder, `generic-command.controller.js`)
  if (['message', 'mssql', 'mysql', 'pg', 'read-excel', 'write-excel', 'read-file', 'write-file', 'datetime', 'cmd'].includes(funcName) == false) {
    controllerName = path.join(__dirname, folder, `${funcName}.controller.js`)
  }

  if (fs.existsSync(controllerName) == false) {
    return null
  } else {
    return require(controllerName)
  }
}


global.setRoutes = (app, route, cb1, cb2) => {
  let dizi = route.split('/:')
  let yol = ''
  dizi.forEach((e, index) => {
    if (index > 0) {
      yol += `/:${e}`
      if (cb1 != undefined && cb2 == undefined) {
        app.all(yol, cb1)
      } else if (cb1 != undefined && cb2 != undefined) {
        app.all(yol, cb1, cb2)
      }
    } else {
      yol += e
    }
  })
}


global.responseError = (err, res) => {
  let error = { name: '403', message: '' }
  if (typeof err == 'string') {
    error.message = err
  } else {
    error.name = err.code || err.name || 'ERROR'
    if (err.message)
      error.message = err.message
    else
      error.message = err.name || ''
  }

  res.status(401).json({ success: false, error: error })
}

global.restError = {
  param1: function (req, next) {
    next({ name: 'INCORRECT_PARAMETER', message: `function:[/${req.params.func}] [/:param1] is required` })
  },
  param2: function (req, next) {
    next({ name: 'INCORRECT_PARAMETER', message: `function:[/${req.params.func}/${req.params.param1}] [/:param2] is required` })
  },
  method: function (req, next) {
    next({ name: 'INCORRECT_METHOD', message: `function:${req.params.func} WRONG METHOD: ${req.method}` })
  },
  auth: function (req, next) {
    next({ name: 'AUTH_FAILED', message: `Authentication failed` })
  },
  data: function (req, next, field) {
    if (field) {
      next({ name: 'INCORRECT_DATA', message: `"${field}" Incorrect or missing data` })

    } else {
      next({ name: 'INCORRECT_DATA', message: `Incorrect or missing data` })

    }
  }
}