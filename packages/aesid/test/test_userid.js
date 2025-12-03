const expect = require('expect.js');
const { AesId } = require('../');

describe('#userid', () => {
	const content = 'test content';
	const aseKey = 'test 123';
	const noUseridSid = new AesId([{
		aes: aseKey,
		version: 0,
		userid: false,
	}])
	.encrypt(content);


	describe('#usrid types', () => {
		const sidAes = new AesId([{
			aes: aseKey,
			version: 0,
			userid: true,
		}]);

		it('#string', () => {
			const sid = sidAes.encrypt(content, 'userid123');
			expect(sidAes.decrypt(sid, 'userid123')).to.be(content);
		});

		it('#number', () => {
			const sid = sidAes.encrypt(content, 1234);
			expect(sidAes.decrypt(sid, 1234)).to.be(content);
		});

		it('#buffer', () => {
			const useridBuf = Buffer.from('userid');
			const sid = sidAes.encrypt(content, useridBuf);
			expect(sidAes.decrypt(sid, useridBuf)).to.be(content);
		});
	});

	describe('#options=true', () => {
		const sidAes = new AesId([{
			aes: aseKey,
			version: 0,
			userid: true,
		}]);

		it('#noUseridSid', () => {
			expect(() => {
				sidAes.decrypt(noUseridSid);
				process.exit();
			})
			.to.throwError(function(err) {
				expect(err.message).to.be('USERID MISS');
			});
		});

		describe('#with userid encrypt', () => {
			const sid = sidAes.encrypt(content, 'userid123');

			it('#no userid decrypt', () => {
				expect(() => {
					sidAes.decrypt(sid);
				})
				.to.throwError(/bad decrypt/);
			});

			it('#not userid decrypt', () => {
				expect(() => {
					sidAes.decrypt(sid, 'userid456');
				})
				.to.throwError(/bad decrypt/);
			});
		});

		describe('#without useid encrypt', () => {
			const sid = sidAes.encrypt(content);

			it('#no userid decrypt', () => {
				expect(sidAes.decrypt(sid)).to.be(content);
			});

			it('#not userid decrypt', () => {
				expect(() => {
					sidAes.decrypt(sid, 'userid123')
				})
				.to.throwError(/bad decrypt/);
			});
		});
	});
});
