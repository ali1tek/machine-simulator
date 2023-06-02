const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
	let schema = mongoose.Schema(
		{
      idCardNo:{type:String, default:'', index:true},
			machine: {
				type: mongoose.Types.ObjectId,
				ref: 'machine',
				required: true,
				index: true,
			},
			logDate: { type: Date, default: Date.now, index: true },
      status: { type: String, default: '', index: true },
			transferred:{type:Boolean, default:false, index:true},
      transferredDate: { type: Date, default: Date.now},
		},
		{ versionKey: false }
	)

	schema.pre('save', (next) => next())
	schema.pre('remove', (next) => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', (model) => {})
	schema.plugin(mongoosePaginate)

	let model = dbModel.conn.model(collectionName, schema, collectionName)

	model.removeOne = (member, filter) =>
		sendToTrash(dbModel, collectionName, member, filter)
	return model
}
