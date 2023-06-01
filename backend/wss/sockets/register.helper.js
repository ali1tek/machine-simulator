const { generateFromEmail, generateUsername } = require('unique-username-generator')
const forbiddenWords=['sex','gay','stupid']
exports.generateFromEmail=(...props)=>{
  let s=generateFromEmail(...props)
  
  if(forbiddenWords.some(e => s.includes(e))){
    return exports.generateFromEmail(...props)
  }else{
    return s
  }
}
exports.generateUsername=(...props)=>{
  let s=generateUsername(...props)
  
  if(forbiddenWords.some(e => s.includes(e))){
    return exports.generateUsername(...props)
  }else{
    return s
  }
}