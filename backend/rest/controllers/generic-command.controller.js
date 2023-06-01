module.exports = (connector, params, req) => new Promise((resolve, reject) => {
	// let apiName = path.basename(__filename, '.controller.js')
	let apiName = req.params.func
	let callback = apiName + '_' + uuid.v4()
  let obj={}
  Object.assign(obj,{},params)
  obj.event=apiName
  obj.callback=callback

	connector.socket.callbackList[callback] = (result) => {
		delete connector.socket.callbackList[callback]
    if (result.success)
			resolve(result.data)
		else
			reject(result.error)

	}

  
	if (['GET', 'POST', 'PUT'].includes(req.method)) {
		connector.socket.send(JSON.stringify(obj))
	} else
		restError.method(req, reject)
})
