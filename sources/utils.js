const util = require('util');

const defaults = {
	rateLimit: 5000,
	expiration: 1000 * 60 * 60, // 1 hour in ms
	timeout: 500 // in ms
};

util.inherits(TimeoutError, Error);

module.exports = {
	defaults,
	normalizeOptionsForGet,
	noop,
	TimeoutError
};


function TimeoutError(message, extra) {
	Error.captureStackTrace(this, this.constructor);

	this.name = this.constructor.name;
	this.message = message;
	this.extra = extra;
}


function normalizeOptionsForGet(opts) {
	const res = {
		limit: (!opts || opts.limit == null) ? defaults.rateLimit : opts.limit,
		expire: (!opts || opts.expire == null) ? defaults.expiration : opts.expire
	};

	assert(typeof res.limit === 'number' && res.limit >= 0, 'Limit option should be number >= 0');
	assert(typeof res.expire === 'number' && res.expire >= 0, 'Expire option should be number >= 0');

	return res;
}

function noop() { }