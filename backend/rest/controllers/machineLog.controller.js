module.exports = (member, dbModel, req) =>
	new Promise(async (resolve, reject) => {
		switch (req.method) {
			case 'GET':
				if (req.params.param1 != undefined) {
					getOne(member, dbModel, req).then(resolve).catch(reject)
				} else {
					getList(member, dbModel, req).then(resolve).catch(reject)
				}
				break
			case 'POST':
				post(member, dbModel, req).then(resolve).catch(reject)
				break
			case 'PUT':
				put(member, dbModel, req).then(resolve).catch(reject)
				break
			case 'DELETE':
				deleteItem(member, dbModel, req).then(resolve).catch(reject)
				break

			default:
				restError.method(req, reject)
				break
		}
	})
function getOne(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		dbModel.machineLog
			.findOne({ _id: req.params.param1 })
			.then(resolve)
			.catch(reject)
	})
}
function getList(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		let options = {
			page: req.query.page || 1,
      select:'-details -id',
      populate:[{
        path:'machine',
        select:'_id name'
      }]
		}

		if (req.query.pageSize || req.query.limit)
			options.limit = req.query.pageSize || req.query.limit

		let filter = {}

		if ((req.query.passive || '') != '') {
			filter.passive = req.query.passive
		}

    if ((req.query.machine || '') != '') {
			filter.machine = req.query.machine
		}

		dbModel.machineLog.paginate(filter, options).then(resolve).catch(reject)
	})
}

function post(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		let data = req.body || {}
		let newDoc = new dbModel.machineLog(data)

		if (!epValidateSync(newDoc, reject)) return

		newDoc.save().then(resolve).catch(reject)
	})
}

// function put(member, dbModel, req) {
// 	return new Promise((resolve, reject) => {
// 		if (req.params.param1 == undefined) return restError.param1(req, reject)

// 		let data = req.body || {}
// 		data._id = req.params.param1
// 		dbModel.machineLog
// 			.findOne({ _id: data._id })
// 			.then((doc) => {
// 				if (docNull(doc, reject)) {
//           doc=Object.assign(doc, data)
					
//           if (!epValidateSync(doc, reject)) return
// 					doc.save().then(resolve).catch(reject)
// 				}
// 			})
// 			.catch(reject)
// 	})
// }

function deleteItem(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		if (req.params.param1 == undefined)
			return restError.param1(req, next)
		let data = req.body || {}
		data._id = req.params.param1
		dbModel.machineLog.removeOne(member, { _id: data._id }).then(resolve).catch(reject)
	})
}