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

			default:
				restError.method(req, reject)
				break
		}
	})

function getOne(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		dbModel.dataLog
			.findOne({ _id: req.params.param1 })
			.then(resolve)
			.catch(reject)
	})
}

function getList(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		let options = {
			page: req.query.page || 1,
      populate:[{
        path:'machine',
        select:'_id name'
      }]
		}

		if (req.query.pageSize || req.query.limit)
			options.limit = req.query.pageSize || req.query.limit

		let filter = {}
		if ((req.query.transferred || '') != '') {
			filter.transferred = req.query.transferred
		}

    if ((req.query.machine || '') != '') {
			filter.machine = req.query.machine
		}

		dbModel.dataLog.paginate(filter, options).then(resolve).catch(reject)
	})
}
