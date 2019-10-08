# AESID

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![NPM License][license-image]][npm-url]
[![Install Size][install-size-image]][install-size-url]

## Install

`npm install aesid --save`

## Usage

```javascript
const aesid = require('aesid');
const sidAes = aesid({
  business: {
    test: {
      1: 'old test aes key',
      2: 'new test aes key',
      // default last one
      last: 2
    }
  }
});

const sid = sidAes.encrypt('test', 'encrypt content');
const content = sidAes.decrypt('test', sid);
```


[npm-image]: https://img.shields.io/npm/v/aesid.svg
[downloads-image]: https://img.shields.io/npm/dm/aesid.svg
[npm-url]: https://www.npmjs.org/package/aesid
[license-image]: https://img.shields.io/npm/l/aesid.svg
[install-size-url]: https://packagephobia.now.sh/result?p=aesid
[install-size-image]: https://packagephobia.now.sh/badge?p=aesid
