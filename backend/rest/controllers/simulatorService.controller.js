module.exports = (member, dbModel, req) =>
	new Promise(async (resolve, reject) => {
		switch (req.method) {
			case 'GET':
				getStatus(member, dbModel, req).then(resolve).catch(reject)
				break
			case 'POST':
        if(req.params.param1=='start'){
				  start(member, dbModel, req).then(resolve).catch(reject)
        }else if(req.params.param1=='stop'){
          stop(member, dbModel, req).then(resolve).catch(reject)
        }else{
          restError.param1(req, reject)
        }
				break
			

			default:
				restError.method(req, reject)
				break
		}
	})
function getStatus(member, dbModel, req) {
	return new Promise((resolve, reject) => {
    resolve({running:global.simulator.serviceRunning})
	})
}

function start(member, dbModel, req) {
	return new Promise((resolve, reject) => {
    global.simulator.start()
    .then(()=>{
      resolve({running:global.simulator.serviceRunning})
    })
    .catch(reject)

	})
}

function stop(member, dbModel, req) {
	return new Promise((resolve, reject) => {
    global.simulator.stop()
    .then(()=>{
      resolve({running:global.simulator.serviceRunning})
    })
    .catch(reject)

	})
}
