const expect = require('expect.js');
const aesid = require('../');

describe('#base', () => {
	describe('#base', () => {
		const sidAes = aesid({
			business: {
				test: 'test 123',
				test2: 'test 123',
			}
		});

		const content = 'test content';
		const sid = sidAes.encrypt('test', content);

		expect(sidAes.decrypt('test', sid)).to.be(content);
		// 跨业务，同sidkey
		expect(sidAes.decrypt('test2', sid)).to.be(content);

		expect(() => {
			sidAes.encrypt('not_exists', content);
		})
		.to.throwError(err => {
			expect(err.message).to.be('BUSINESS_AES_KEY MISS');
		});

		expect(() => {
			sidAes.decrypt('not_exists', sid);
		})
		.to.throwError(err => {
			expect(err.message).to.be('BUSINESS_AES_KEY MISS');
		});
	});


	describe('#version', () => {
		const content = 'test content';
		const sidAes = aesid({
			business: {
				test1: [
					{version: 0, aes: 'test 123'},
					{version: 3, aes: 'test 1234'},
				],
				test2: [
					{version: 3, aes: 'test 1234'},
					{version: 0, aes: 'test 123'},
				]
			}
		});

		it('#getDecryptAesVersion', () => {
			let sid = sidAes.encrypt('test1', content);
			expect(sidAes.getDecryptAesVersion(sid)).to.be(3);

			sid = sidAes.encrypt('test2', content);
			expect(sidAes.getDecryptAesVersion(sid)).to.be(0);
		});


		it('#use last', () => {
			const sid = sidAes.encrypt('test1', content);
			expect(sidAes.decrypt('test1', sid)).to.be(content);
			expect(sidAes.decrypt('test2', sid)).to.be(content);
		});
	});


	describe('#business', () => {
		const sidAes = aesid({
			business: {
				test: 'test 123'
			}
		});

		const content = 'test content';

		it('#run', () => {
			const aesObj = sidAes.business('test');
			const sid = aesObj.encrypt(content);
			expect(aesObj.decrypt(sid)).to.be(content);
		});

		it('#not found', () => {
			expect(sidAes.business('not_exists')).to.be(undefined);
		});
	});
});
