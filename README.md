# AESID

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Appveyor Status][appveyor-image]][appveyor-url]
[![Coveralls][coveralls-image]][coveralls-url]
[![NPM License][license-image]][npm-url]
[![Install Size][install-size-image]][install-size-url]

## Install

`npm install aesid --save`

## Useage

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


[npm-image]: http://img.shields.io/npm/v/aesid.svg
[downloads-image]: http://img.shields.io/npm/dm/aesid.svg
[npm-url]: https://www.npmjs.org/package/aesid
[travis-image]: http://img.shields.io/travis/Bacra/node-aesid/master.svg?label=linux
[travis-url]: https://travis-ci.org/Bacra/node-aesid
[appveyor-image]: https://img.shields.io/appveyor/ci/Bacra/node-aesid/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/Bacra/node-aesid
[coveralls-image]: https://img.shields.io/coveralls/Bacra/node-aesid.svg
[coveralls-url]: https://coveralls.io/github/Bacra/node-aesid
[license-image]: http://img.shields.io/npm/l/aesid.svg
[install-size-url]: https://packagephobia.now.sh/result?p=aesid
[install-size-image]: https://packagephobia.now.sh/badge?p=aesid
