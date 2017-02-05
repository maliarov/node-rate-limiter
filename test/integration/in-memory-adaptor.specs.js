const async = require('async');
const NodeRateLimiter = require('../../sources/node-rate-limiter');

describe('wrap method call', () => {
	const someMethod = sinon.spy((arg1, arg2, cb) => cb(null, arg1 + arg2));

	const opts = { limit: 2, expire: 10000 };
	const nodeRateLimiter = new NodeRateLimiter();

	it('should limit calls', (done) => {
		const repeatTimes = 10;
		const task = (i, cb) => limitCallOfSomeMethod('test.1', 1, 2, (err, res) => cb(null, {err: err, res: res}));
		
		async.times(repeatTimes, task, (err, res) => {
			expect(someMethod).to.be.callCount(opts.limit);
			expect(res.filter((v, i) => v.err && v.err.name === 'RateLimitError')).to.have.length(repeatTimes - opts.limit);
			expect(res.filter((v, i) => v.res)).to.have.length(opts.limit);
			done();
		});
	});


	function limitCallOfSomeMethod(clientId, arg1, arg2, callback) {
		nodeRateLimiter.get(clientId, opts, (err, limit) => {
			if (err) {
				return callback(err);
			}
			if (!limit.remaining) {
				return callback(new NodeRateLimiter.RateLimitError(limit));
			}

			someMethod(arg1, arg2, callback);
		});
	}
});