const assert = require('assert');
const util = require('util');

const defaults = {
	rateLimit: 5000,
	expiration: 1000 * 60 * 60, // 1 hour in ms
	timeout: 500 // in ms
};

util.inherits(TimeoutError, Error);
util.inherits(RateLimitError, Error);

module.exports = {
	defaults,
	normalizeOptionsForGet,
	noop,
	TimeoutError,
	RateLimitError
};


function TimeoutError(message, extra) {
	Error.captureStackTrace(this, this.constructor);

	this.name = this.constructor.name;
	this.message = message;
	this.extra = extra;
}

function RateLimitError(message, limit) {
	if (limit == null && typeof message === 'object') {
		limit = message;
		message = null;
	}

	Error.captureStackTrace(this, this.constructor);

	assert(limit && limit.limit !== undefined && limit.refresh !== undefined, 'limit must be {limit: N, refresh: M}');

	message = message || `Maximum call limit (${limit.limit}) exceeded, you can re-try in ${limit.refresh} ms`;

	this.name = this.constructor.name;
	this.message = message;
	this.limit = limit;
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