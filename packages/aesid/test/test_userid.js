const expect = require('expect.js');
const aesid = require('../');

describe('#userid', () => {
	describe('#userid true', () => {
		const content = 'test content';
		const sidAes = aesid({
			userid: true,
			business: {
				test: {
					1: 'test 123'
				}
			}
		});

		describe('#types', () => {
			it('#string', () => {
				const sid = sidAes.encrypt('test', content, 'userid123');
				expect(sidAes.decrypt('test', sid, 'userid123')).to.be(content);
			});

			it('#number', () => {
				const sid = sidAes.encrypt('test', content, 1234);
				expect(sidAes.decrypt('test', sid, 1234)).to.be(content);
			});

			it('#buffer', () => {
				const useridBuf = Buffer.from('userid');
				const sid = sidAes.encrypt('test', content, useridBuf);
				expect(sidAes.decrypt('test', sid, useridBuf)).to.be(content);
			});
		});

		describe('#run env', () => {
			describe('#with userid encrypt', () => {
				const sid = sidAes.encrypt('test', content, 'userid123');

				it('#no userid decrypt', () => {
					expect(() => {
						sidAes.decrypt('test', sid);
					}).to.throwError();
				});

				it('#not userid decrypt', () => {
					expect(() => {
						sidAes.decrypt('test', sid, 'userid456');
					}).to.throwError();
				});
			});

			describe('#without useid encrypt', () => {
				const sid = sidAes.encrypt('test', content);

				it('#no userid decrypt', () => {
					expect(sidAes.decrypt('test', sid)).to.be(content);
				});

				it('#not userid decrypt', () => {
					expect(() => {
						sidAes.decrypt('test', sid, 'userid123')
					}).to.throwError();
				});
			});
		});
	});

	describe('#userid auto', () => {
		const content = 'test content';
		const sidAes = aesid({
			userid: 'auto',
			business: {
				test: {
					1: 'test 123'
				}
			}
		});

		describe('#with userid encrypt', () => {
			const sid = sidAes.encrypt('test', content, 'userid123');

			it('#userid decrypt', () => {
				expect(sidAes.decrypt('test', sid, 'userid123')).to.be(content);
			});

			it('#no userid decrypt', () => {
				expect(() => {
					sidAes.decrypt('test', sid)
				}).to.throwError();
			});
		});

		describe('#without userid encrypt', () => {
			const sid = sidAes.encrypt('test', content);

			it('#userid decrypt', () => {
				expect(sidAes.decrypt('test', sid, 'userid123')).to.be(content);
			});

			it('#no userid decrypt', () => {
				expect(sidAes.decrypt('test', sid)).to.be(content);
			});
		});
	});
});
