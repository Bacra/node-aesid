# AESID

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![NPM License][license-image]][npm-url]
[![Install Size][install-size-image]][install-size-url]

## Install

`npm install aesid --save`

## Usage

```javascript
import { AesId } from 'aesid';
const sidAes = new AesId([
    // mulit versions
    { version: 2, aes: 'old test aes key' },
    { version: 5, aes: 'new test aes key' },
  ], {
    userid: true,   // true/false/auto
  });

const sid = sidAes.encrypt('encrypt content', 'userid');
const content = sidAes.decrypt(sid, 'userid');
```

## Upgrade

### 3.x => 4.x

 * export `AesId` class
 * remove `is` func


[npm-image]: https://img.shields.io/npm/v/aesid.svg
[downloads-image]: https://img.shields.io/npm/dm/aesid.svg
[npm-url]: https://www.npmjs.org/package/aesid
[license-image]: https://img.shields.io/npm/l/aesid.svg
[install-size-url]: https://packagephobia.now.sh/result?p=aesid
[install-size-image]: https://packagephobia.now.sh/badge?p=aesid
