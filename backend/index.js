(async ()=>{
  global.__root = __dirname
  await require('./lib/initialize')()
  
  await require('./db/db-loader')()
  var app=await require('./app')()
  await require('./rest/routes')(app)
  eventLog(`[RestAPI]`.cyan, 'started')
  var httpServer = await require('./lib/http-server')(process.env.HTTP_PORT, app)
  
  global.simulator= require('./simulator/simulator-service')

  simulator.start()
  .then(()=>{
    eventLog(`Application was started properly :-)`.yellow)
  })
  .catch(errorLog)

  // await require('./wss/wss')(httpServer)
  
  if(process.env.NODE_ENV=='development'){
    eventLog(`http://localhost:${process.env.HTTP_PORT}`)
  }
  
  process.env.NODE_ENV!='development' && process.on('uncaughtException', err => { errorLog('Caught exception: ', err) })
  process.env.NODE_ENV!='development' && process.on('unhandledRejection', err => { errorLog('Caught rejection: ', err) })
})()
