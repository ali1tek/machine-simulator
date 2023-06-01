module.exports = async (socket, data) => {
  try {
    let connDoc = await db.connectors.findOne({ clientId: data.clientId, clientPass: data.clientPass })
    if (connDoc == null) {
      socket.sendError('Authentication failed')

      purgeSocket(socket)
    // } else if (global.wss.socketListByClientId[connDoc.clientId] && global.wss.socketListByClientId[connDoc.clientId].id != socket.id) {
    //   socket.sendError('Multiple usage detected. Request rejected')
    } else {
      connDoc.lastUuid = socket.id
      connDoc.lastOnline = new Date()
      connDoc.lastIP = socket.ip
      await connDoc.save()
      socket.subscribed = true
      global.wss.socketListByClientId[connDoc.clientId] = socket
      socket.sendSuccess('subscribed', { uuid: socket.id, message: 'Subscription was successful' })
    }
  } catch (err) {
    errorLog(`[Subscribe]`.cyan, err)
    socket.sendError(err)
  }

  // .then(connDoc => {
  // 	if(connDoc==null){
  // 		socket.emit('error', {name:'AUTH',message:'Authentication failed'})
  // 		purgeSocket(socket)
  // 	}else	if(connDoc.lastUuid && global.socketClients[connDoc.lastUuid]){
  // 		socket.emit('error', {name:'MULTIPLE_USAGE',message:'Multiple usage detected. Request rejected'})

  // 		purgeSocket(socket)
  // 	}else{

  // 	}

  // })
  // .catch(err => {
  // 	socket.emit('error', err)
  // })
}
