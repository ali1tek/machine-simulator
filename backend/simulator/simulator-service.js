var machineParams={}
var simulationInterval=null

exports.serviceRunning=false

exports.start=()=>new Promise((resolve, reject)=>{
  exports.serviceRunning=true
  simulationInterval=setInterval(()=>{
    eventLog('simulating',util.randomNumber(0,100).toString().yellow)
  },1000)
  resolve('Simulator service started')

})

exports.stop=()=>new Promise((resolve, reject)=>{
  exports.serviceRunning=false
  if(simulationInterval){
    clearInterval(simulationInterval)
    simulationInterval=null
  }
  resolve('Simulator service stoped')
})

function pushDataToAPIServer(machineName,param,value){
  
}