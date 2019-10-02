const _ = require('lodash');
const crypto = require('crypto');
const debug = require('debug')('aesid');

module.exports = function(options) {
	if (!options) options = {};
	const businessMap = {};

	_.each(options.business, function (keys, businessType) {
		const newkeys = businessMap[businessType] = {};
		let hasLastKey = false;

		_.each(keys, function(aeskey, version) {
			if (version == 'last') {
				hasLastKey = true;
				newkeys.last = +aeskey;
			} else {
				newkeys[+version] = Buffer.alloc(32, Buffer.from(aeskey));
				if (!hasLastKey) newkeys.last = +version;
			}
		});
	});

	debug('business init: %o', businessMap);

	function encrypt(businessType, data, userid) {
		if (options.userid && !Buffer.isBuffer(userid) && typeof userid != 'string') {
			userid = '' + userid;
		}

		const IV = crypto.randomBytes(16);
		const AES_VERSION = businessMap[businessType].last;
		const BUSINESS_AES_KEY = businessMap[businessType][AES_VERSION];
		const AES_KEY = options.userid
			? crypto.createHmac('sha256', BUSINESS_AES_KEY).update(userid).digest()
			: BUSINESS_AES_KEY;

		const buf = Buffer.isBuffer(data) ? data : Buffer.from('' + data);

		const output = [
			// 预留版本号
			Buffer.alloc(1, 1),
			Buffer.alloc(1, AES_VERSION),
			IV
		];

		debug('encrypt aeskey: %s, iv: %s', AES_KEY, IV);

		const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, IV);
		output.push(cipher.update(buf), cipher.final());

		return Buffer.concat(output).toString('base64');
	}

	function decrypt(businessType, sid, userid) {
		if (options.userid && !Buffer.isBuffer(userid) && typeof userid != 'string') {
			userid = '' + userid;
		}

		const buf = Buffer.isBuffer(sid) ? sid : Buffer.from(sid, 'base64');

		const AES_VERSION = buf.readUInt8(1);
		const BUSINESS_AES_KEY = businessMap[businessType][AES_VERSION];
		const AES_KEY = options.userid
			? crypto.createHmac('sha256', BUSINESS_AES_KEY).update(userid).digest()
			: BUSINESS_AES_KEY;

		if (!Buffer.isBuffer(AES_KEY)) throw new Error('Not Found AES KEY');

		const IV = buf.slice(2, 16 + 2);
		const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, IV);

		debug('encrypt aeskey: %s, iv: %s', AES_KEY, IV);

		return decipher.update(buf.slice(16 + 2), 'utf8')
			+ decipher.final('utf8');
	}

	return {
		encrypt,
		decrypt,

		business: function(businessType) {
			return {
				encrypt: function(data, userid) {
					return encrypt(businessType, data, userid);
				},
				decrypt: function(sid, userid) {
					return decrypt(businessType, sid, userid);
				},
			}
		}
	};
};
