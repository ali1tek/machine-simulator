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
		dbModel.machines
			.findOne({ _id: req.params.param1 })
			.then(resolve)
			.catch(reject)
	})
}
function getList(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		let options = {
			page: req.query.page || 1,
		}

		if (req.query.pageSize || req.query.limit)
			options.limit = req.query.pageSize || req.query.limit

		let filter = {}

		if ((req.query.passive || '') != '') {
			filter.passive = req.query.passive
		}

		dbModel.machines.paginate(filter, options).then(resolve).catch(reject)
	})
}

function post(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		let data = req.body || {}
		let newDoc = new dbModel.machines(data)

		if (!epValidateSync(newDoc, reject)) return

		newDoc.save().then(resolve).catch(reject)
	})
}

function put(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		if (req.params.param1 == undefined) return restError.param1(req, reject)

		let data = req.body || {}
		data._id = req.params.param1
		dbModel.machines
			.findOne({ _id: data._id })
			.then((doc) => {
				if (docNull(doc, reject)) {
					let newDoc = new dbModel.machines(Object.assign({}, doc, data))
					if (!epValidateSync(newDoc, reject)) return
					newDoc.save().then(resolve).catch(reject)
				}
			})
			.catch(reject)

		newDoc.save().then(resolve).catch(reject)
	})
}
