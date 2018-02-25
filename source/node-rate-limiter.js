const assert = require('assert');
const utils = require('./utils');
const InMemoryAdaptor = require('./in-memory-adaptor');

module.exports = NodeRateLimiter;


NodeRateLimiter.defaults = utils.defaults;
NodeRateLimiter.TimeoutError = utils.TimeoutError;
NodeRateLimiter.RateLimitError = utils.RateLimitError;

function NodeRateLimiter(adaptor) {
	assert(this instanceof NodeRateLimiter, 'NodeRateLimiter should be created with new keyword: new NodeRateLimiter(...)');

	adaptor = adaptor || new InMemoryAdaptor();

	assert(typeof adaptor.reset === 'function', 'Adaptor should provide reset method: reset(id, callback)');
	assert(typeof adaptor.get === 'function', 'Adaptor should provide get method: get(id, opts, callback)');

	let isPrepared = typeof adaptor.prepare !== 'function';

	this.reset = reset;
	this.get = get;
	this.getAdaptorName = getAdaptorName;


	function reset(id, callback) {
		assert(id != null, 'id argument must be provided: reset(id, ...)');

		id = id.toString();

		return prepare(callback || utils.noop, (cb) =>
			adaptor.reset(id, cb)
		);
	}

	function get(id, opts, callback) {
		assert(id != null, 'id argument must be provided: get(id, ...)');

		id = id.toString();

		if (callback === undefined && typeof opts === 'function') {
			callback = opts;
			opts = null;
		}

		return prepare(callback || utils.noop, (cb) =>
			adaptor.get(id, utils.normalizeOptionsForGet(opts), cb)
		);
	}

	function getAdaptorName() {
		return adaptor.name;
	}

	function prepare(callback, next) {
		if (isPrepared) {
			return next(callback);
		}

		adaptor.prepare((err) => {
			if (err) {
				return callback(err);
			}

			isPrepared = true;
			next(callback);
		});
	}
}