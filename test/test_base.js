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

	describe('#userid', () => {
		const content = 'test content';
		const sidAes = aesid({
			userid: true,
			business: {
				test: {
					1: 'test 123'
				}
			}
		});

		it('#string', function() {
			const sid = sidAes.encrypt('test', content, 'userid123');
			expect(sidAes.decrypt('test', sid, 'userid123')).to.be(content);
		});

		it('#number', function() {
			const sid = sidAes.encrypt('test', content, 1234);
			expect(sidAes.decrypt('test', sid, 1234)).to.be(content);
		});

		it('#buffer', function() {
			const useridBuf = Buffer.from('userid');
			const sid = sidAes.encrypt('test', content, useridBuf);
			expect(sidAes.decrypt('test', sid, useridBuf)).to.be(content);
		});
	});
});
