const InMemoryAdaptor = require('../../sources/in-memory-adaptor');

describe('InMemoryAdaptor', () => {
	const id = 'client.1';

	it('should be class instance', () =>
		expect(() => InMemoryAdaptor()).to.throw(assert.AssertionError).to.have.property('message').contains('new InMemoryAdaptor(...)')
	);

	describe('reset(id, callback)', () => {
		const state = { [id]: { total: 200, expire: +new Date() + 100000 } };
		const adaptor = new InMemoryAdaptor(state);

		before((done) => {
			adaptor.reset(id, done);
		});
		it('should be no state after', () => {
			expect(state[id]).to.not.exist;
		});
	});

	describe('get(id, opts, callback)', () => {
		const state = {};
		const adaptor = new InMemoryAdaptor(state);
		const opts = { limit: 10, expire: 1000 };
		const date = +new Date();

		before(done =>
			adaptor.reset(id, done)
		);

		[9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0].forEach((v, i) => {
			it('should return valid limit\'s info on call #' + (i + 1), (done) => {
				adaptor.get(id, opts, (err, limit) => {
					expect(limit).to.be.ok;
					expect(limit).to.have.property('limit', 10);
					expect(limit).to.have.property('remaining', v);
					expect(limit).to.have.property('refresh').to.be.at.least(+new Date() - date);
					done();
				});
			});
		});

		it('should return limit\'s info with reseted remaining attempts on call afte expire', function (done) {
			this.timeout(opts.expire * 2);

			setTimeout(() => {
				const date = +new Date();
				adaptor.get(id, opts, (err, limit) => {
					expect(limit).to.be.ok;
					expect(limit).to.have.property('limit', 10);
					expect(limit).to.have.property('remaining', 9);
					expect(limit).to.have.property('refresh').to.be.at.least(+new Date() - date);
					done();
				});
			}, opts.expire * 1.1);
		});
	});

});
