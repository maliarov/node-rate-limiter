const assert = require('assert');

module.exports = InMemoryAdaptor;

function InMemoryAdaptor(stateMap) {
	assert(this instanceof InMemoryAdaptor, 'InMemoryAdaptor should be created with new keyword: new InMemoryAdaptor(...)');

	const state = stateMap || {};

	this.name = InMemoryAdaptor.name;

	this.reset = (id, callback) => {
		delete state[id];
		callback();
	};

	this.get = (id, {limit, expire} = {}, callback) => {
		const date = +new Date();
		let meta = state[id];

		if (meta && meta.expire <= date) {
			meta = null;
			delete state[id];
		}

		if (!meta) {
			meta = {
				total: 0,
				limit: limit + 1,
				expire: date + expire
			};

			if (limit && expire) {
				state[id] = meta;
			}
		}

		meta.total++;

		if (meta.total >= meta.limit) {
			meta.total = meta.limit;
		}

		const result = {
			limit: meta.limit - 1,
			remaining: meta.limit - meta.total,
			refresh: meta.expire - date
		};
		return callback(null, result);
	};
}