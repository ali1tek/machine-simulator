const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
	let schema = mongoose.Schema(
		{
			machine: {
				type: mongoose.Types.ObjectId,
				ref: 'machine',
				required: true,
				index: true,
			},
			logDate: { type: Date, default: Date.now, index: true },
			type: {
				type: String,
				default: '',
				enum: ['status', 'technical', 'shift'],
				index: true,
			},
      message:{type:String, default:''},
			description: { type: String, default: '' },
			details: { type: Object, default: null },
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
