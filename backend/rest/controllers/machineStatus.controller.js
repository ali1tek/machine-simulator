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
			case 'PUT':
				put(member, dbModel, req).then(resolve).catch(reject)
				break
			default:
				restError.method(req, reject)
				break
		}
	})

function getOne(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		dbModel.machine
			.findOne({ _id: req.params.param1 })
			.select('_id name status statusChangedDate passive')
			.then(resolve)
			.catch(reject)
	})
}

function getList(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		let options = {
			page: req.query.page || 1,
			select: '_id name status statusChangedDate passive',
		}

		if (req.query.pageSize || req.query.limit)
			options.limit = req.query.pageSize || req.query.limit

		let filter = {}

		if ((req.query.passive || '') != '') {
			filter.passive = req.query.passive
		}

		dbModel.machine.paginate(filter, options).then(resolve).catch(reject)
	})
}

function put(member, dbModel, req) {
	return new Promise((resolve, reject) => {
		if (req.params.param1 == undefined) return restError.param1(req, reject)
		let status = req.getValue('status')
		let description = req.getValue('description')
    if(!status)
      return reject(`'status' required`)
      
		dbModel.machine
			.findOne({ _id: req.params.param1 })
			.then((machineDoc) => {
				if (docNull(machineDoc, reject)) {
          const oldStatus=machineDoc.status
          const newStatus=status
          if(oldStatus==newStatus){
            return reject(`Old and new statuses are the same`)
          }
					machineDoc.status = status
					machineDoc.statusChangedDate = new Date()
					machineDoc
						.save()
						.then((machineDoc) => {
							let machineLogDoc = new dbModel.machineLog({
								machine: machineDoc._id,
								type: 'status',
                message:`Status changed from '${oldStatus}' to '${newStatus}'`,
								description: description,
							})
							machineLogDoc.save().then(newLog=>{
                resolve(newLog.message)
              }).catch(reject)
						})
						.catch(reject)
				}
			})
			.catch(reject)
	})
}
