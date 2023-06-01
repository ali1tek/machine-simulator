var ipList = {}

module.exports=(ipAddress,userOptions)=>{
  var options={
    suspendInterval:3600    // defaul 1 hour
  }
  Object.assign(options,userOptions || {})

  devLog(`ipList`,ipList )
  let t = (new Date()).getTime()
  if (ipList[ipAddress] && ipList[ipAddress].suspended.getTime() > t) {
    let diffSeconds = Math.ceil((ipList[ipAddress].suspended.getTime() - t) / 1000 / 60)
    return diffSeconds
  }
  

  if (ipList[ipAddress] == undefined) {
    ipList[ipAddress] = {
      attemptCount: 1,
      firstAttempt: new Date(),
      suspended:  dateAddSecond(new Date(),-1)
    }
    return false
  } else {
    if (ipList[ipAddress].firstAttempt == null) {
      ipList[ipAddress].firstAttempt = new Date()
    }
    ipList[ipAddress].attemptCount++
    let diffSeconds = ((new Date()).getTime() - ipList[ipAddress].firstAttempt.getTime()) / 1000

    if (ipList[ipAddress].attemptCount > 10 && diffSeconds < 60) {
      ipList[ipAddress].suspended = dateAddSecond(new Date(),options.suspendInterval)
      ipList[ipAddress].attemptCount = 0
      ipList[ipAddress].firstAttempt = null
      return options.suspendInterval
    } else if (ipList[ipAddress].attemptCount > 30 && diffSeconds > 60 && diffSeconds < options.suspendInterval) {
      ipList[ipAddress].suspended = dateAddSecond(new Date(),options.suspendInterval)
      ipList[ipAddress].attemptCount = 0
      ipList[ipAddress].firstAttempt = null

      return options.suspendInterval
    } else if (ipList[ipAddress].attemptCount > 10 && diffSeconds > 60) {
      ipList[ipAddress].attemptCount = 0
      ipList[ipAddress].firstAttempt = null
      return false
    } else {
      return false
    }

  }
}

function dateAddSecond(date, units){
  let d=new Date(date)
  return new Date(d.setTime(d.getTime() + units * 1000))
}