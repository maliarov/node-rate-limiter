const utils = require('../../source/utils');
const InMemoryAdaptor = require('../../source/in-memory-adaptor');
const NodeRateLimiter = require('../../source/node-rate-limiter');

describe('NodeRateLimiter', () => {
	it('should be class instance', () =>
		expect(() => NodeRateLimiter()).to.throw(assert.AssertionError).to.have.property('message').contains('new NodeRateLimiter(...)')
	);

	describe('requires adaptor that', () => {
		it('should provide reset method', () =>
			expect(() => new NodeRateLimiter({})).to.throw(assert.AssertionError).to.have.property('message').contains('reset(id, callback)')
		);
		it('should provide get method', () =>
			expect(() => new NodeRateLimiter({ reset: () => { } })).to.throw(assert.AssertionError).to.have.property('message').contains('get(id, opts, callback)')
		);
	});

	describe('work with adaptor', () => {
		it('should use im-memory-adaptor as default', () => {
			const nodeRateLimiter = new NodeRateLimiter();
			expect(nodeRateLimiter.getAdaptorName()).to.be.eq(InMemoryAdaptor.name);
		});

		describe('methods', () => {
			let adaptor;
			let nodeRateLimiter;

			beforeEach(() => {
				adaptor = {
					prepare: sinon.spy((cb) => cb()),
					reset: sinon.spy((id, cb) => cb()),
					get: sinon.spy((id, opts, cb) => cb())
				};

				nodeRateLimiter = new NodeRateLimiter(adaptor);
			});

			describe('reset(id, callback)', () => {
				it('should validate args', () => {
					expect(() => nodeRateLimiter.reset()).to.throw(assert.AssertionError).to.have.property('message').contains('id argument');
				});

				it('should prepare args', (done) => {
					nodeRateLimiter.reset(1, () => {
						expect(adaptor.reset).have.been.calledWith('1');
						done();
					});
				});

				it('should call prepare method once', (done) => {
					nodeRateLimiter.reset(1, () => {
						nodeRateLimiter.reset(1, () => {

							expect(adaptor.prepare).to.have.been.calledOnce;

							expect(adaptor.reset).have.been.calledAfter(adaptor.prepare);
							expect(adaptor.reset).have.been.calledTwice;

							done();
						});
					});
				});
			});

			describe('get(id, opts, callback)', () => {
				it('should validate args', () => {
					expect(() => nodeRateLimiter.get()).to.throw(assert.AssertionError).to.have.property('message').contains('id argument');
				});

				it('should prepare args', (done) => {
					nodeRateLimiter.get(1, () => {
						expect(adaptor.get).have.been.calledWith('1');
						done();
					});
				});

				it('should provide default opts', (done) => {
					nodeRateLimiter.get(1, (err, limit) => {
						expect(adaptor.get).have.been.calledWith('1', utils.normalizeOptionsForGet());
						done();
					});
				});

				it('should call prepare method once', (done) => {
					nodeRateLimiter.get(1, () => {
						nodeRateLimiter.get(1, () => {
							expect(adaptor.prepare).to.have.been.calledOnce;

							expect(adaptor.get).have.been.calledAfter(adaptor.prepare);
							expect(adaptor.get).have.been.calledTwice;

							done();
						});
					});
				});
			});
		});
	});
});