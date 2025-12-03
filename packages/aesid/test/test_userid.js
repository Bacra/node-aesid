const expect = require('expect.js');
const { AesId } = require('../');

describe('#userid', () => {
	const content = 'test content';
	const aseKey = 'test 123';
	const withUseridSidAes = new AesId([{
		aes: aseKey,
		version: 0,
		userid: true,
	}]);

	const noUseridSidAes = new AesId([{
		aes: aseKey,
		version: 0,
		userid: false,
	}]);

	// it('#encrypt error', () => {
	// 	expect(() => {
	// 		withUseridSidAes.encrypt(content);
	// 	})
	// 	.to.throwError('USERID MISS');
	// });

	describe('#userid params types', () => {
		it('#string', () => {
			const sid = withUseridSidAes.encrypt(content, 'userid123');
			expect(withUseridSidAes.decrypt(sid, 'userid123')).to.be(content);
		});

		it('#number', () => {
			const sid = withUseridSidAes.encrypt(content, 1234);
			expect(withUseridSidAes.decrypt(sid, 1234)).to.be(content);
		});

		it('#buffer', () => {
			const useridBuf = Buffer.from('userid');
			const sid = withUseridSidAes.encrypt(content, useridBuf);
			expect(withUseridSidAes.decrypt(sid, useridBuf)).to.be(content);
		});
	});

	describe('#cross-analysis data', () => {
		it('#withUseridSidAes => noUseridSidAes', () => {
			expect(() => {
				withUseridSidAes.decrypt(noUseridSidAes.encrypt(content));
			})
			.to.throwError(function(err) {
				expect(err.message).to.be('USERID MISS');
			});
		});

		it('#noUseridSidAes => withUseridSidAes', () => {
			expect(() => {
				noUseridSidAes.decrypt(withUseridSidAes.encrypt(content, 'userid123'));
			})
			.to.throwError(function(err) {
				expect(err.message).to.be('INVALD USERID FLAG');
			});
		});
	});

	describe('#with userid encrypt', () => {
		const sid = withUseridSidAes.encrypt(content, 'userid123');

		it('#no userid', () => {
			expect(() => {
				withUseridSidAes.decrypt(sid);
			})
			.to.throwError('USERID MISS');
		});

		it('#userid not same', () => {
			expect(() => {
				withUseridSidAes.decrypt(sid, 'userid456');
			})
			.to.throwError(/bad decrypt/);
		});
	});
});
