const expect = require('expect.js');
const aesid = require('../');

describe('#fromsid', () => {
	const sidAes = aesid('test 123');
	const sid = sidAes.encrypt('test content');

	it('#base', () => {
		const content = 'newsid 456';
		const cipher = sidAes.createCipherFromSid(sid);
		const newsid = cipher.update(content, 'utf8', 'base64') + cipher.final('base64');

		const decipher = sidAes.createDecipherFromSid(sid);
		const content2 = decipher.update(newsid, 'base64', 'utf8') + decipher.final('utf8');

		expect(content2).to.be(content);
	});

});
