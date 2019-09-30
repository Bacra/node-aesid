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
});
