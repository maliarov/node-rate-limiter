const async = require('async');
const NodeRateLimiter = require('../../source/node-rate-limiter');

describe('wrap method call', () => {
	const clientId = 'test.1';
	const someMethod = sinon.spy((arg1, arg2, cb) => cb(null, arg1 + arg2));

	const opts = { limit: 2, expire: 1000 };
	const nodeRateLimiter = new NodeRateLimiter();

	it('should limit calls', (done) => {
		const repeatTimes = 10;
		const task = (i, cb) => limitCallOfSomeMethod(clientId, 1, 2, (err, res) => cb(null, { err: err, res: res }));

		async.times(repeatTimes, task, (err, res) => {
			expect(someMethod).to.be.callCount(opts.limit);
			expect(res.filter((v, i) => v.err && v.err.name === 'RateLimitError')).to.have.length(repeatTimes - opts.limit);
			expect(res.filter((v, i) => v.res)).to.have.length(opts.limit);
			done();
		});
	});

	it('should allow call after limited timeframe expires', function (done) {
		this.timeout(opts.expire * 1.2);

		setTimeout(() => {
			limitCallOfSomeMethod(clientId, 1, 2, (err, res) => {
				expect(err).to.not.exist;
				expect(res).to.exist;
				done();
			});
		}, opts.expire * 1.1);
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