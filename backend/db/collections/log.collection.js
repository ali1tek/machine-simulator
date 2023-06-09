const collectionName = path.basename(__filename, '.collection.js')
module.exports = function(dbModel) {
	let schema = mongoose.Schema({
		type: { type: String, default:'' },
		date: { type: Date, default: Date.now },
		data: { type: Object, default: null }
	}, { versionKey: false })

	schema.pre('save', next => next())
	schema.pre('remove', next => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', model => {})
	schema.plugin(mongoosePaginate)

	let model = dbModel.conn.model(collectionName, schema, collectionName)

	return model
}