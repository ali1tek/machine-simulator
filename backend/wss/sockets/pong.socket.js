module.exports = (socket, data) => {
  socket.lastPong = new Date()
  socket.isAlive = true

  // if (socket.isConnector && socket.subscribed && socket.connector._id) {
    
  if (socket.isConnector && socket.connector.clientId) {
    socket.connector.lastOnline=socket.lastPong
    db.connectors.updateOne({_id:socket.connector._id, clientId: socket.connector.clientId }, {
      $set: {
        lastOnline: socket.connector.lastOnline,
        lastUuid: socket.connector.lastUuid,
        lastIP: socket.connector.lastIP,
      }
    })
      .then(()=>{})
      .catch(errorLog)

  }
}
