
(async ()=>{
  global.__root = __dirname
  await require('./lib/initialize')()
  await require('./db/db-loader')()
  var app=await require('./app')()
  var httpServer = await require('./lib/http-server')(process.env.HTTP_PORT, app)
  
  await require('./wss-api/wss-api')(httpServer)
  eventLog(`Application was started properly :-)`.yellow)
  if(process.env.NODE_ENV=='development'){
    eventLog(`http://localhost:${process.env.HTTP_PORT}`)
  }
  
  process.env.NODE_ENV!='development' && process.on('uncaughtException', err => { errorLog('Caught exception: ', err) })
  process.env.NODE_ENV!='development' && process.on('unhandledRejection', err => { errorLog('Caught rejection: ', err) })
})()
