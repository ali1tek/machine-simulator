const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
	let schema =new mongoose.Schema(
		{
			machine: {
				type: mongoose.Types.ObjectId,
				ref: 'machine',
				required: true,
				index: true,
			},
			logDate: { type: Date, default: Date.now, index: true },
      status: { type: String, default: '', index: true },
			param: { type: String, default: '', index: true },
      value: { type: Number, default: 0, index:true },
			transferred:{type:Boolean, default:false, index:true},
      transferredDate: { type: Date, default: Date.now},
		},
		{ versionKey: false, capped: { size: 86400000, max: 500, autoIndexId: true }}
	)

	schema.pre('save', (next) => next())
	schema.pre('remove', (next) => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', (model) => {})
	schema.plugin(mongoosePaginate)

	let model = dbModel.conn.model(collectionName, schema, collectionName)
  

  // Object.keys(dbModel.conn.db.s).forEach(e=>{ console.log(`dbModel.conn.db.s.${e}:`, typeof dbModel.conn.db.s[e]) })
  // Object.keys(model.db.db).forEach(e=>{ console.log(`model.db.db.${e}:`, typeof model.db.db[e]) })
  Object.keys(dbModel.conn.collections.dataLog).forEach(e=>{ console.log(`${e}:`, typeof dbModel.conn.collections.dataLog[e]) })
  // dbModel.runCommand({collMod:collectionName, cappedMax:250})
	model.removeOne = (member, filter) =>
		sendToTrash(dbModel, collectionName, member, filter)
	return model
}
