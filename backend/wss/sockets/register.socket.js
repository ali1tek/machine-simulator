const registerHelper=require('./register.helper')

module.exports = (socket, data) => {


  newId(socket, data)
    .then(connDoc => {
      socket.send(JSON.stringify({
        event: 'registered',
        clientId: connDoc.clientId,
        clientPass: connDoc.clientPass
      }))
    })
    .catch(err => {
      errorLog(err)
      socket.send(JSON.stringify({ event: 'error', error: err.message }))
      // socket.close()
      // purgeSocket(socket)
    })
}


function newId(socket, data) {

  return new Promise(async (resolve, reject) => {
    try {
      const timesInMinute = await spamCheck(socket.ip, 'minute', 1, 1)
      const timesInOneHour = await spamCheck(socket.ip, 'hour', 1, 20)
      devLog(`[Register/SpamChek]`.brightGreen, `${socket.ip} in a minute ${timesInMinute} times`)
      devLog(`[Register/SpamChek]`.brightGreen, `${socket.ip} in one hour ${timesInOneHour} times`)
      const newClientId = await generateClientId(data, [])
      const newClientPass = data.clientPass || registerHelper.generateFromEmail(registerHelper.generateUsername('', 0, 6), 2)
      console.log(`newClientId`, newClientId)
      console.log(`newClientPass`, newClientPass)

      let newDoc = await (new db.connectors({
        // _id: ObjectId(),
        clientId: newClientId,
        clientPass: newClientPass,
        lastIP: socket.ip,
        lastUuid: socket.id,
        lastOnline: socket.lastPong,
        createdIP: socket.ip,
        osInfo: data.osInfo || {}
      })).save()
      socket.connector._id = newDoc._id.toString()
      socket.connector.clientId = newDoc.clientId
      socket.connector.clientPass = newDoc.clientPass
      resolve(newDoc)


    } catch (err) {
      reject(err)
    }
  })
}

async function generateClientId(data, alreadyExists = []) {

    let clientId = ''
    if (data) {
      if (data.clientId && !alreadyExists.includes(data.clientId.toString().toLowerCase().trim())) {
        clientId = data.clientId.toString().trim()
      } else {
        let username = (data.osInfo && data.osInfo.userInfo && data.osInfo.userInfo.username || '').toLowerCase().trim()
        if (username.startsWith('admin') || username.startsWith('root') || username.startsWith('user')) {
          username = ''
        }

        if(username && !alreadyExists.includes(username)){
          if (await db.connectors.countDocuments({ clientId: username }) == 0) {
            return username
          }else{
            alreadyExists.push(username)
          }
        }

        let hostname = (data.osInfo && (data.osInfo.hostname || '').toLowerCase()).trim() || ''

        if(hostname && !alreadyExists.includes(hostname)){
          if (await db.connectors.countDocuments({ clientId: hostname }) == 0) {
            return hostname
          }else{
            alreadyExists.push(hostname)
          }
        }

        let suggestion = username || hostname || registerHelper.generateUsername('', 0, 8) || ''
  
        clientId = registerHelper.generateFromEmail(suggestion, 3)
      }
    } else {
      clientId = registerHelper.generateUsername('', 2, 8)
    }
    if (await db.connectors.countDocuments({ clientId: clientId }) == 0) {
      return clientId
    } else {
      alreadyExists.push(clientId)
      return generateClientId(data, alreadyExists)
    }

  // })
}

// function generateId() {
//   let first = util.randomNumber(100, 999).toDigit(3)
//   let second = util.randomNumber(0, 999).toDigit(3)
//   let third = util.randomNumber(0, 999).toDigit(3)
//   return first + second + third
// }

function spamCheck(IP, interval, ago, maxCount) {
  return new Promise((resolve, reject) => {
    let t = (new Date()).add(interval, -1 * ago)
    db.connectors.countDocuments({ createdIP: IP, createdDate: { $gte: t } })
      .then(c => {
        if (c > maxCount) {
          reject(`Register/SpamCheck IP:${IP} Maximum attempts exceeded`)
        } else {
          resolve(c)
        }
      })
      .catch(reject)
  })
}
