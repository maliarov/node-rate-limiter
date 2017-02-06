const utils = require('../../source/utils');

describe('utils', () => {
	describe('normalizeOptionsForGet(opts)', () => {
		it('should provide default values for opts if not defined', () => {
			let opts = utils.normalizeOptionsForGet({});

			expect(opts).to.have.property('limit', utils.defaults.rateLimit);
			expect(opts).to.have.property('expire', utils.defaults.expiration);

			opts = utils.normalizeOptionsForGet();

			expect(opts).to.be.a('object');
			expect(opts).to.have.property('limit', utils.defaults.rateLimit);
			expect(opts).to.have.property('expire', utils.defaults.expiration);
		});

		it('should validate opts', () => {
			const limitAssertionMessage = 'Limit option should be number >= 0';
			const expireAssersionMessage = 'Expire option should be number >= 0';

			expect(() => utils.normalizeOptionsForGet({ limit: -1 })).to.throw(assert.AssertError).to.have.property('message', limitAssertionMessage);
			expect(() => utils.normalizeOptionsForGet({ limit: 'dsafdsf' })).to.throw(assert.AssertError).to.have.property('message', limitAssertionMessage);
			expect(() => utils.normalizeOptionsForGet({ limit: {} })).to.throw(assert.AssertError).to.have.property('message', limitAssertionMessage);
			expect(utils.normalizeOptionsForGet({ limit: 0 })).to.have.property('limit', 0);
			expect(utils.normalizeOptionsForGet({ limit: 0 })).to.have.property('limit', 0);

			expect(() => utils.normalizeOptionsForGet({ expire: -1 })).to.throw(assert.AssertError).to.have.property('message', expireAssersionMessage);
			expect(() => utils.normalizeOptionsForGet({ expire: 'dsafdsf' })).to.throw(assert.AssertError).to.have.property('message', expireAssersionMessage);
			expect(() => utils.normalizeOptionsForGet({ expire: {} })).to.throw(assert.AssertError).to.have.property('message', expireAssersionMessage);
			expect(utils.normalizeOptionsForGet({ expire: 0 })).to.have.property('expire', 0);
			expect(utils.normalizeOptionsForGet({ expire: 10000 })).to.have.property('expire', 10000);
		});
	});

});