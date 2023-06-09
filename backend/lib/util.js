String.prototype.padding = function (n, c) {
	var val = this.valueOf()
	if (Math.abs(n) <= val.length) {
		return val
	}
	var m = Math.max((Math.abs(n) - this.length) || 0, 0)
	var pad = Array(m + 1).join(String(c || ' ').charAt(0))
	return (n < 0) ? pad + val : val + pad
}

Number.prototype.toDigit = function (digit) {
	var t = this
	var s = t.toString()
	if (s.length < digit) {
		s = '0'.repeat(digit - s.length) + s
	}
	return s
}



Date.prototype.yyyymmddhhmmss = function (middleChar = ' ', removeTimeOffset = false) {
	let d = new Date(this.valueOf())
	if (removeTimeOffset) {
		d.setMinutes(d.getMinutes() + (new Date()).getTimezoneOffset())
	}

	return `${d.getFullYear()}-${(d.getMonth() + 1).toDigit(2)}-${d.getDate().toDigit(2)}${middleChar}${d.getHours().toDigit(2)}:${d.getMinutes().toDigit(2)}:${d.getSeconds().toDigit(2)}`
}


Date.prototype.addDays = function (days) {
	var dat = new Date(this.valueOf())
	dat.setDate(dat.getDate() + days)
	return dat
}

Date.prototype.add = function (interval, units) {
	var dat = new Date(this.valueOf())
	return exports.dateAdd(dat, interval, units)
}

exports.dateAdd = function (date, interval, units) {
	if (!(date instanceof Date))
		return undefined
	let ret = new Date(date) //don't change original date
	let checkRollover = function () {
		if (ret.getDate() != date.getDate())
			ret.setDate(0)
	}
	switch (String(interval).toLowerCase()) {
		case 'year':
			ret.setFullYear(ret.getFullYear() + units)
			checkRollover()
			break
		case 'quarter':
			ret.setMonth(ret.getMonth() + 3 * units)
			checkRollover()
			break
		case 'month':
			ret.setMonth(ret.getMonth() + units)
			checkRollover()
			break
		case 'week':
			ret.setDate(ret.getDate() + 7 * units)
			break
		case 'day':
			ret.setDate(ret.getDate() + units)
			break
		case 'hour':
			ret.setTime(ret.getTime() + units * 3600000)
			break
		case 'minute':
			ret.setTime(ret.getTime() + units * 60000)
			break
		case 'second':
			ret.setTime(ret.getTime() + units * 1000)
			break
		default:
			ret = undefined
			break
	}
	return ret
}

Date.prototype.lastThisMonth = function () {
	let dat = new Date(this.valueOf());
	dat = new Date((new Date(dat.setMonth(dat.getMonth() + 1))).setDate(0))
	return dat
}

global.eventLog = function (obj, ...placeholders) {
	console.log(new Date().yyyymmddhhmmss(), obj, ...placeholders)
}

global.errorLog = function (obj, ...placeholders) {
	console.error(new Date().yyyymmddhhmmss().red, obj, ...placeholders)
}

global.warnLog = function (obj, ...placeholders) {
	console.error(new Date().yyyymmddhhmmss().yellow, obj, ...placeholders)
}


global.devLog=(...props)=>{
  if(process.env.NODE_ENV==='development'){
    eventLog(...props)
  }
}

global.devError=(...props)=>{
  if(process.env.NODE_ENV==='development'){
    errorLog(...props)
  }
}


exports.moduleLoader=(folder, suffix)=>{
  return new Promise((resolve, reject) => {
		try {
			let holder = {}
			let files = fs.readdirSync(folder)
			files.forEach((e) => {
				let f = path.join(folder, e)
				if (!fs.statSync(f).isDirectory()) {
					let fileName = path.basename(f)
					let apiName = fileName.substr(0, fileName.length - suffix.length)
					if (apiName != '' && (apiName + suffix) == fileName) {
						holder[apiName] = require(f)
					}
				}
			})
			resolve(holder)
		} catch (err) {
			reject(err)
		}
	})
}

exports.randomNumber = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

exports.clone=function(obj){
  if(Array.isArray(obj) || typeof obj=='object'){
    return JSON.parse(JSON.stringify(obj))
  }else{
    return obj
  }
  
}