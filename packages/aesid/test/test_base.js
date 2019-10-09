const expect = require('expect.js');
const aesid = require('../');
const debug = require('debug')('aesid:test_base');

describe('#base', () => {
	describe('#base', () => {
		const sidAes1 = aesid('test 123');
		const sidAes2 = aesid('test 123');

		const content = 'test content';
		const sid = sidAes1.encrypt(content);
		const sid2 = sidAes1.encrypt(content);
		debug('sid: %s, sid2: %s', sid, sid2);
		expect(sid2).not.to.be(sid);

		expect(sidAes1.decrypt(sid)).to.be(content);
		// 跨业务，同sidkey
		expect(sidAes2.decrypt(sid)).to.be(content);

		expect(aesid.is(sidAes1)).to.be(true);
		console.log(sidAes1.version());
	});

	it('#params', () => {
		expect(() => {
			aesid();
		})
		.to.throwError(err => {
			expect(err.message).to.be('AES KEY MISS');
		});

		expect(() => {
			aesid([]);
		})
		.to.throwError(err => {
			expect(err.message).to.be('AES KEY MISS');
		});

		expect(() => {
			aesid([
				{ version: 'a', aes: '234235' }
			]);
		})
		.to.throwError(err => {
			expect(err.message).to.be('AES KEY MISS');
		});

		expect(() => {
			aesid([
				{ version: 1, aes: '234235' },
				{ version: 1, aes: '23443' }
			]);
		})
		.to.throwError(err => {
			expect(err.message).to.be('AES VERSION IS REPEAT,1');
		});
	});


	describe('#version', () => {
		const content = 'test content';
		const sidAes1 = aesid([
			{version: 0, aes: 'test 123'},
			{version: 3, aes: 'test 1234'},
		]);
		const sidAes2 = aesid([
			{version: 3, aes: 'test 1234'},
			{version: 0, aes: 'test 123'},
		]);

		it('#getDecryptAesVersion', () => {
			let sid = sidAes1.encrypt(content);
			expect(sidAes1.getDecryptAesVersion(sid)).to.be(3);

			sid = sidAes2.encrypt(content);
			expect(sidAes2.getDecryptAesVersion(sid)).to.be(0);
		});


		it('#use last', () => {
			const sid = sidAes1.encrypt(content);
			expect(sidAes1.decrypt(sid)).to.be(content);
			expect(sidAes2.decrypt(sid)).to.be(content);
		});
	});

});
