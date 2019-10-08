const expect = require('expect.js');
const aesid = require('../');

describe('#base', () => {
	it('#base', () => {
		const sidAes = aesid({
			business: {
				test: {
					1: 'test 123'
				}
			}
		});

		const content = 'test content';
		const sid = sidAes.encrypt('test', content);

		expect(sidAes.decrypt('test', sid)).to.be(content);
	});

	it('#version', () => {
		const sidOptions = {
			business: {
				test: {
					1: 'test 123',
					2: 'test 1234',
					last: 1
				}
			}
		};

		const sidAes1 = aesid(sidOptions);
		sidOptions.business.test.last = 2;
		const sidAes2 = aesid(sidOptions);

		const content = 'test content';
		const sid = sidAes1.encrypt('test', content);

		expect(sidAes1.decrypt('test', sid)).to.be(content);
		expect(sidAes2.decrypt('test', sid)).to.be(content);
	});

	it('#business', () => {
		const aesObj = aesid({
			business: {
				test: {
					1: 'test 123'
				}
			}
		})
		.business('test');

		const content = 'test content';
		const sid = aesObj.encrypt(content);

		expect(aesObj.decrypt(sid)).to.be(content);
	});
});
