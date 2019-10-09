const crypto = require('crypto');
const debug = require('debug')('aesid');

// 特性功能标识位
const FEATURE_USRID = 1 << 0;

/**
 * options.userid  true/false/auto  是否使用userid进行额外加密
 */
module.exports = function(aesObj, options) {
	if (!aesObj) throw new Error('AES KEY MISS');
	if (!options) options = {};

	const aseKeys = {};
	if (!Array.isArray(aesObj)) aesObj = [{version: 0, aes: aesObj}];

	aesObj.forEach(function(item) {
		if (!item) return;

		if (isNaN(item.version)) {
			debug('ignore nan version for aes: %o', item);
			return;
		}

		const version = +item.version;
		if (aseKeys[version]) {
			debug('aes version repeat: %s', version);
			throw new Error('AES VERSION IS REPEAT,' + version);
		}

		aseKeys[version] = Buffer.alloc(32, Buffer.from(item.aes));
		aseKeys.last = version;
	});

	if (!('last' in aseKeys)) throw new Error('AES KEY MISS');

	debug('aesKeys init: %s', Object.keys(aseKeys));

	function encrypt(data, userid) {
		var isWithUserid = options.userid;
		if (isWithUserid && !Buffer.isBuffer(userid) && typeof userid != 'string') {
			if (!userid && options.userid == 'auto') {
				isWithUserid = false;
				debug('userid auto, ignore userid');
			}

			if (!userid && options.userid === true) {
				debug('no userid in options.userid=true: %o', userid);
			}

			userid = '' + userid;
		}

		const IV = crypto.randomBytes(16);
		const AES_VERSION = aseKeys.last;
		const BUSINESS_AES_KEY = aseKeys[AES_VERSION];

		const AES_KEY = isWithUserid
			? crypto.createHmac('sha256', BUSINESS_AES_KEY).update(userid).digest()
			: BUSINESS_AES_KEY;

		const buf = Buffer.isBuffer(data) ? data : Buffer.from('' + data);
		let flag = 0;
		if (isWithUserid) flag |= FEATURE_USRID;

		const output = [
			// 预留版本号
			Buffer.alloc(1, 1),
			// 功能特性
			Buffer.alloc(1, flag),
			// aes key的版本号
			Buffer.alloc(1, AES_VERSION),
			IV
		];

		const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, IV);
		output.push(cipher.update(buf), cipher.final());

		return Buffer.concat(output).toString('base64');
	}

	function _sidToBuffer(sid) {
		return Buffer.isBuffer(sid) ? sid : Buffer.from(sid, 'base64');
	}

	function _getDecryptAesVersion(buf) {
		return buf.readUInt8(2);
	}

	function _getDecryptAesIV(buf) {
		return buf.slice(3, 16 + 3);
	}

	function decrypt(sid, userid) {
		const buf = _sidToBuffer(sid);

		const FEATURE_FLAG = buf.readUInt8(1);
		const isWithUserid = FEATURE_FLAG & FEATURE_USRID;
		if (options.userid === true && !isWithUserid) throw new Error('USERID MISS');

		if (isWithUserid && !Buffer.isBuffer(userid) && typeof userid != 'string') {
			userid = '' + userid;
		}

		const AES_VERSION = _getDecryptAesVersion(buf);
		const BUSINESS_AES_KEY = aseKeys[AES_VERSION];
		if (!BUSINESS_AES_KEY) throw new Error('BUSINESS_AES_KEY MISS');

		const AES_KEY = isWithUserid
			? crypto.createHmac('sha256', BUSINESS_AES_KEY).update(userid).digest()
			: BUSINESS_AES_KEY;

		if (!Buffer.isBuffer(AES_KEY)) throw new Error('Not Found AES KEY');

		const IV = _getDecryptAesIV(buf);
		const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, IV);

		return decipher.update(buf.slice(16 + 3), 'utf8')
			+ decipher.final('utf8');
	}

	return {
		encrypt,
		decrypt,
		getDecryptAesVersion: function(sid) {
			return _getDecryptAesVersion(_sidToBuffer(sid));
		},
		getDecryptAesIV: function(sid) {
			return _getDecryptAesIV(_sidToBuffer(sid));
		},
	};
};
