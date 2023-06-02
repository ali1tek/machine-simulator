global.machineIntervalList = []

exports.serviceRunning = false

exports.start = () =>
	new Promise((resolve, reject) => {
		clearMachineIntervalList()
		db.machine
			.find({
				passive: false,
				status: { $in: ['on', 'running', 'stoped', 'pending'] },
			})
			.select('_id name params status')
			.then((docs) => {
				docs.forEach((e) => {
					if (e.params) {
						e.params.forEach((param, paramIndex) => {
							if (param.isRandomData && param.min < param.max) {
								addMachineInterval(e, paramIndex)
							}
						})
					}
				})
			})
			.catch(errorLog)
		exports.serviceRunning = true
		eventLog('Simulator service started')
		resolve()
	})

exports.restart = exports.start

exports.stop = () =>
	new Promise((resolve, reject) => {
		clearMachineIntervalList()
		exports.serviceRunning = false
		eventLog('Simulator service stoped')
		resolve()
	})

function addMachineInterval(machineDoc, paramIndex) {
	let param = machineDoc.params[paramIndex]
	let obj = {
		machineId: machineDoc._id,
		intervalId: null,
	}
	obj.intervalId = setInterval(() => {
		let value = param.value
		let diff1 = -1 * param.maxDiffValuePerCycle
		let diff2 = param.maxDiffValuePerCycle
		if (value < param.min || value > param.max)
			value = Math.round((param.max - param.min) / 2)

		if (value + diff1 < param.min) diff1 = -1 * Math.abs(value - param.min)
		if (value + diff2 > param.max) diff2 = param.max - value

		value += util.randomNumber(diff1, diff2)

		param.value = value
		machineDoc
			.save()
			.then((machineDoc) => {
				let dataLogDoc = new db.dataLog({
					machine: machineDoc._id,
					status: machineDoc.status,
					param: param.name,
					value: param.value,
					transferred: false,
				})
				dataLogDoc
					.save()
					.then((dataLogDoc) => {
						eventLog(
							`${machineDoc.name.padding(20).cyan} ${machineDoc.status.padding(8)} `,
							dataLogDoc.param.padding(16).green,
							(dataLogDoc.value || '').toString().padding(-5).yellow
						)
					})
					.catch(errorLog)
			})
			.catch(errorLog)
	}, param.randomDataPeriod)
	global.machineIntervalList.push(obj)
}

function clearMachineIntervalList() {
	machineIntervalList.forEach((e) => {
		if (e.intervalId) {
			clearInterval(e.intervalId)
		}
	})
	machineIntervalList = []
}

function pushDataToAPIServer(machineName, param, value) {
	let randomDelay = util.randomNumber(400, 3000)
	setTimeout(() => {}, randomDelay)
}
