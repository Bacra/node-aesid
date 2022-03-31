import crypto from 'crypto';
const debug = require('debug')('aesid');

export const version = require('../package.json').version;

// 特性功能标识位
const FEATURE_USRID = 1 << 0;

function _sidToBuffer(sid: Buffer | string): Buffer {
	return Buffer.isBuffer(sid) ? sid : Buffer.from(sid, 'base64');
}

function _getDecryptAesVersion(buf: Buffer): number {
	return buf.readUInt8(2);
}

function _getDecryptAesIV(buf: Buffer): Buffer {
	return buf.slice(3, 16 + 3);
}

export type AesVers = string | Array<{
	version: number,
	aes: string,
}>;

type AesKeysMap = {
	[version: number]: Buffer
};

export type Options = {
	userid?: boolean | 'auto',
};

export class AesId {
	private aesKeys: AesKeysMap;
	private lastAesVersion: number;
	private options: Options;

	constructor(aesVers: AesVers, options: Options = {}) {
		if (!aesVers) throw new Error('AES KEY MISS');

		this.aesKeys = {};
		this.options = options;
		if (!Array.isArray(aesVers)) aesVers = [{version: 0, aes: aesVers}];

		aesVers.forEach(item => {
			if (!item) return;

			if (isNaN(item.version)) {
				debug('ignore nan version for aes: %o', item);
				return;
			}

			const version = +item.version;
			if (this.aesKeys[version]) {
				debug('aes version repeat: %s', version);
				throw new Error('AES VERSION IS REPEAT,' + version);
			}

			this.aesKeys[version] = Buffer.alloc(32, Buffer.from(item.aes));
			this.lastAesVersion = version;
		});

		// @ts-ignore
		if (this.lastAesVersion === undefined) throw new Error('AES KEY MISS');

		debug('aesKeys init: %s', Object.keys(this.aesKeys));
	}

	public encrypt(data: any, userid?: any) {
		let isWithUserid = this.options.userid;
		if (isWithUserid && !Buffer.isBuffer(userid) && typeof userid != 'string') {
			if (!userid && isWithUserid === 'auto') {
				isWithUserid = false;
				debug('userid auto, ignore userid');
			}

			if (!userid && isWithUserid === true) {
				debug('no userid in options.userid=true: %o', userid);
			}

			userid = '' + userid;
		}

		const IV = crypto.randomBytes(16);
		const AES_VERSION = this.lastAesVersion;
		const BUSINESS_AES_KEY = this.aesKeys[AES_VERSION];

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

	private _getDecryptAesInfo(buf: Buffer, userid?: any) {
		const FEATURE_FLAG = buf.readUInt8(1);
		const isWithUserid = FEATURE_FLAG & FEATURE_USRID;
		if (this.options.userid === true && !isWithUserid) throw new Error('USERID MISS');

		if (isWithUserid && !Buffer.isBuffer(userid) && typeof userid != 'string') {
			userid = '' + userid;
		}

		const AES_VERSION = _getDecryptAesVersion(buf);
		const BUSINESS_AES_KEY = this.aesKeys[AES_VERSION];
		if (!BUSINESS_AES_KEY) throw new Error('BUSINESS_AES_KEY MISS');

		const AES_KEY = isWithUserid
			? crypto.createHmac('sha256', BUSINESS_AES_KEY).update(userid).digest()
			: BUSINESS_AES_KEY;

		if (!Buffer.isBuffer(AES_KEY)) throw new Error('Not Found AES KEY');

		const IV = _getDecryptAesIV(buf);

		return { IV, AES_KEY };
	}

	public decrypt(sid: Buffer | string, userid?: any) {
		const buf = _sidToBuffer(sid);

		const { AES_KEY, IV } = this._getDecryptAesInfo(buf, userid);
		const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, IV);

		return decipher.update(buf.slice(16 + 3))
			+ decipher.final('utf8');
	}

	public getDecryptAesVersion(sid: Buffer | string) {
		return _getDecryptAesVersion(_sidToBuffer(sid));
	}

	public getDecryptAesIV(sid: Buffer | string) {
		return _getDecryptAesIV(_sidToBuffer(sid));
	}

	public createDecipherFromSid(sid: Buffer | string, userid?: any) {
		const buf = _sidToBuffer(sid);
		const { AES_KEY, IV } = this._getDecryptAesInfo(buf, userid);
		return crypto.createDecipheriv('aes-256-cbc', AES_KEY, IV);
	}

	public createCipherFromSid(sid: Buffer | string, userid?: any) {
		const buf = _sidToBuffer(sid);
		const { AES_KEY, IV } = this._getDecryptAesInfo(buf, userid);
		return crypto.createCipheriv('aes-256-cbc', AES_KEY, IV);
	}

}
