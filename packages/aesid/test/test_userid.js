const expect = require('expect.js');
const aesid = require('../');

describe('#userid', () => {
	const content = 'test content';
	const business = {
		test: 'test 123'
	};

	const noUseridSid = aesid({
		userid: false,
		business: business,
	})
	.encrypt('test', content);


	describe('#usrid types', () => {
		const sidAes = aesid({
			userid: true,
			business: business,
		});

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

	describe('#options=true', () => {
		const sidAes = aesid({
			userid: true,
			business: business,
		});

		it('#noUseridSid', () => {
			expect(() => {
				sidAes.decrypt('test', noUseridSid);
				process.exit();
			})
			.to.throwError(function(err) {
				expect(err.message).to.be('USERID MISS');
			});
		});

		describe('#with userid encrypt', () => {
			const sid = sidAes.encrypt('test', content, 'userid123');

			it('#no userid decrypt', () => {
				expect(() => {
					sidAes.decrypt('test', sid);
				})
				.to.throwError(/bad decrypt/);
			});

			it('#not userid decrypt', () => {
				expect(() => {
					sidAes.decrypt('test', sid, 'userid456');
				})
				.to.throwError(/bad decrypt/);
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
				})
				.to.throwError(/bad decrypt/);
			});
		});
	});

	describe('#options=auto', () => {
		const sidAes = aesid({
			userid: 'auto',
			business: business,
		});

		it('#noUseridSid', () => {
			expect(sidAes.decrypt('test', noUseridSid)).to.be(content);
		});

		describe('#with userid encrypt', () => {
			const sid = sidAes.encrypt('test', content, 'userid123');

			it('#userid decrypt', () => {
				expect(sidAes.decrypt('test', sid, 'userid123')).to.be(content);
			});

			it('#no userid decrypt', () => {
				expect(() => {
					sidAes.decrypt('test', sid)
				})
				.to.throwError(/bad decrypt/);
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
