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

type AesVerOptions = {
	version: number,
	aes: string | Buffer,

	userid?: boolean,
};
export type AesVers = string | Array<AesVerOptions>;


export class AesId {
	private aesKeys: Record<number, { aes: Buffer, options: AesVerOptions }>;
	private lastAesVersion: number;

	constructor(aesVers: AesVers) {
		if (!aesVers) throw new Error('AES KEY MISS');

		this.aesKeys = {};
		if (!Array.isArray(aesVers)) aesVers = [{ version: 0, aes: aesVers }];

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

			this.aesKeys[version] = {
				aes: Buffer.alloc(32, Buffer.isBuffer(item.aes) ? item.aes : Buffer.from(item.aes)),
				options: item,
			};
			this.lastAesVersion = version;
		});

		// @ts-ignore
		if (typeof this.lastAesVersion === 'undefined') throw new Error('AES KEY MISS');

		debug('aesKeys init: %s', Object.keys(this.aesKeys));
	}

	public encrypt(data: any, userid?: any) {
		const AES_VERSION = this.lastAesVersion;
		const aesKeyItem = this.aesKeys[AES_VERSION];

		let isWithUserid = aesKeyItem.options.userid;
		if (isWithUserid && !Buffer.isBuffer(userid) && typeof userid !== 'string') {
			if (!userid) debug('no userid in options.userid=true: %o', userid);
			userid = '' + userid;
		}

		const IV = crypto.randomBytes(16);

		const AES_KEY = isWithUserid
			? crypto.createHmac('sha256', aesKeyItem.aes).update(userid).digest()
			: aesKeyItem.aes;

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
		const AES_VERSION = _getDecryptAesVersion(buf);
		const aesKeyItem = this.aesKeys[AES_VERSION];
		if (!aesKeyItem) throw new Error('BUSINESS_AES_KEY MISS');

		const FEATURE_FLAG = buf.readUInt8(1);
		const isWithUserid = FEATURE_FLAG & FEATURE_USRID;
		if (aesKeyItem.options.userid === true && !isWithUserid) throw new Error('USERID MISS');
		if (!aesKeyItem.options.userid && isWithUserid) throw new Error('INVALD USERID FLAG');

		if (isWithUserid && !Buffer.isBuffer(userid) && typeof userid !== 'string') {
			userid = '' + userid;
		}

		const AES_KEY = isWithUserid
			? crypto.createHmac('sha256', aesKeyItem.aes).update(userid).digest()
			: aesKeyItem.aes;

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

	public decryptToBuffer(sid: Buffer | string, userid?: any) {
		const buf = _sidToBuffer(sid);

		const { AES_KEY, IV } = this._getDecryptAesInfo(buf, userid);
		const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, IV);

		return Buffer.concat([
			decipher.update(buf.slice(16 + 3)),
			decipher.final()
		]);
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
