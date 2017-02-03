const util = require('util');

module.exports = NodeRateLimiter;

NodeRateLimiter.defaultRateLimit = 5000;
NodeRateLimiter.defaultExpiration = 1000 * 60 * 60;
NodeRateLimiter.defaultTimeout = 500;

NodeRateLimiter.TimeoutError = TimeoutError;

util.inherits(TimeoutError, Error);


function NodeRateLimiter(adaptor) {
	adaptor = adaptor || new InMemoryAdaptor();

	let isPrepared = typeof adaptor.prepare !== 'function';

	this.reset = (id, callback) => (callback = callback || noop) && prepare(callback, () => adaptor.reset(id, callback));
	this.get = (id, opts, callback) => (callback = callback || noop) && prepare(callback, () => adaptor.get(id, opts, callback));


	function prepare(fail, next) {
		if (isPrepared) {
			return next();
		}

		adaptor.prepare((err) => {
			if (err) {
				return fail(err);
			}

			isPrepared = true;
			next();
		});
	}
}

function TimeoutError(message, extra) {
	Error.captureStackTrace(this, this.constructor);

	this.name = this.constructor.name;
	this.message = message;
	this.extra = extra;
}


function InMemoryAdaptor() {
	const map = {};

	this.reset = (id, callback) => {
		delete map[id];
		callback();
	};

	this.get = (id, opts, callback) => {
		const date = +new Date();
		let meta = map[id];

		if (meta && meta.expire <= date) {
			meta = null;
			delete map[id];
		}

		if (!meta) {
			meta = map[id] = {
				total: 0,
				limit: opts && opts.limit || NodeRateLimiter.defaultRateLimit,
				expire: date + (opts && opts.expire || NodeRateLimiter.defaultExpiration)
			};
		}

		meta.total++;

		if (meta.total >= meta.limit) {
			meta.total = meta.limit;

			const result = {
				limit: meta.limit,
				remaining: meta.limit - meta.total,
				refresh: meta.expire - date
			};
			return callback(null, result);
		}

		return callback(null);
	};
}

function noop() { }
