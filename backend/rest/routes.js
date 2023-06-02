const packageJson = require('../package.json')
const apiWelcomeMessage = {
	message: `Welcome to ${packageJson.name} API V1. Usage: /api/v1/:func/[:param1]/[:param2]/[:param3] . Methods: GET, POST, PUT, DELETE `,
	status: process.env.NODE_ENV || '',
}

module.exports = (app) =>
	new Promise((resolve, reject) => {
		app.all('/*', (req, res, next) => {
			req.IP =
				req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''
			req.getValue = (key) => {
				return req.headers[key] || req.body[key] || req.query[key] || ''
			}

			next()
		})

		app.all('/api', function (req, res) {
			res.status(200).json({ success: true, data: apiWelcomeMessage })
		})

		app.all('/api/v1', function (req, res) {
			res.status(200).json({ success: true, data: apiWelcomeMessage })
		})

		masterControllers(app, '/api/v1/:func/:param1/:param2/:param3', 'controllers')

		// catch 404 and forward to error handler
		app.use((req, res, next) => {
			res.status(404).json({
				success: false,
				error: { name: '404', message: 'function not found' },
			})
		})

		app.use((err, req, res, next) => {
			console.log(`err22`, err)
			console.log('params22', req.params)
			sendError(err, req, res)
		})
    resolve()
	})

function masterControllers(app, route, folder) {
	setRoutes(app, route, (req, res, next) => {
		const ctl = getController(folder, req.params.func)
		if (!ctl) return next()
    let dbModel=db

		passport(req)
			.then((member) => {
				ctl(member,dbModel, req)
					.then((data) => {
						if (data == undefined) res.json({ success: true })
						else if (data == null) res.json({ success: true })
						else {
							res.status(200).json({
								success: true,
								data: data,
							})
						}
					})
					.catch(next)
			})
			.catch(next)
	})
}

function getController(folder, funcName) {
	const controllerName = path.join(
		__dirname,
		folder,
		`${funcName}.controller.js`
	)
  console.log(`controllerName`, controllerName)
	if (fs.existsSync(controllerName) == false) {
		return null
	} else {
		return require(controllerName)
	}
}

function sendError(err, req, res) {
	let errorMessage = 'Error'
	let statusCode = 400
	if (typeof err == 'string') {
		errorMessage = err
	} else {
		if (err.message) errorMessage = err.message
	}

	let response = { success: false, error: errorMessage }

	if (errorMessage.toLowerCase().includes('not found')) statusCode = 404

	res.status(statusCode).json(response)
}

function setRoutes(app, route, cb1, cb2) {
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

/// Authorization functions reserved for using in the future.
function passport(req) {
	return new Promise((resolve, reject) => {
		resolve({
			_id: '64769b5a15785dfd6d945693',
			username: 'admin',
		})
	})
}

global.restError = {
	param1: function (req, next) {
		next(`function:[/${req.params.func}] [/:param1] is required`)
	},
	param2: function (req, next) {
		next(
			`function:[/${req.params.func}/${req.params.param1}] [/:param2] is required`
		)
	},
	method: function (req, next) {
		next(`function:${req.params.func} WRONG METHOD: ${req.method}`)
	},
	auth: function (req, next) {
		next(`Authentication failed`)
	},
	data: function (req, next, field) {
		if (field) {
			next(`'${field}' Incorrect or missing data`)
		} else {
			next(`Incorrect or missing data`)
		}
	},
}
