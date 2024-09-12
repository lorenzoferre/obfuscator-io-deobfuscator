![](https://github.com/lorenzoferre/obf-io-deobfuscator/actions/workflows/ci.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Obfuscator.io deobfuscator
Deobfuscate the obfuscated code from [obfuscator.io](https://obfuscator.io) using Babel
# Usage
First of all you need to install the package:
```
npm i obf-io-deobfuscator
```
Then you import the deobfuscation function into your module which takes the obfuscated code as input:
```javascript
import deobfuscate from "obf-io-deobfuscator";
const code = `` // insert the obfuscated code from obfuscator.io here
const deobfuscatedCode = deobfuscate(code)
console.log(deobfuscatedCode)
```
Or if you want to use a file as input:
```javascript
import deobfuscate from "obf-io-deobfuscator";
import fs from "fs";

const path = ""; // insert the file path
const code = fs.readFileSync(path, "utf-8");
const deobfuscatedCode = deobfuscate(code)
console.log(deobfuscatedCode)
```
# Example
```javascript
import deobfuscate from "obf-io-deobfuscator";
const code = `
function _0x11ae(_0x4b29f4, _0x2d1895) {
  const _0xc5911f = _0xc591();
  return (
    (_0x11ae = function (_0x11aedf, _0x52dd30) {
      _0x11aedf = _0x11aedf - 0x137;
      let _0x23031d = _0xc5911f[_0x11aedf];
      return _0x23031d;
    }),
    _0x11ae(_0x4b29f4, _0x2d1895)
  );
}
(function (_0x550b9d, _0x8ad72f) {
  const _0x324197 = _0x11ae,
    _0x547354 = _0x550b9d();
  while (!![]) {
    try {
      const _0x4ea237 =
        (-parseInt(_0x324197(0x141)) / 0x1) * (parseInt(_0x324197(0x137)) / 0x2) +
        -parseInt(_0x324197(0x138)) / 0x3 +
        (-parseInt(_0x324197(0x13b)) / 0x4) * (-parseInt(_0x324197(0x140)) / 0x5) +
        parseInt(_0x324197(0x139)) / 0x6 +
        (-parseInt(_0x324197(0x13e)) / 0x7) * (-parseInt(_0x324197(0x13a)) / 0x8) +
        (-parseInt(_0x324197(0x13f)) / 0x9) * (parseInt(_0x324197(0x13c)) / 0xa) +
        parseInt(_0x324197(0x13d)) / 0xb;
      if (_0x4ea237 === _0x8ad72f) break;
      else _0x547354["push"](_0x547354["shift"]());
    } catch (_0x306a69) {
      _0x547354["push"](_0x547354["shift"]());
    }
  }
})(_0xc591, 0x808e3);
let sum = 0x0;
for (let i = 0x0; i < 0xa; i++) {
  sum += i;
}
function _0xc591() {
  const _0x14660e = [
    "662690XbGiGM",
    "81UujaoE",
    "249295dwolTV",
    "960694NAiJkj",
    "2BHHGHQ",
    "1495683LWIcUv",
    "2511168jZCRsi",
    "64kjIPjP",
    "12nbLwgS",
    "209220afqcnU",
    "9335161vjndQO",
  ];
  _0xc591 = function () {
    return _0x14660e;
  };
  return _0xc591();
}
console["log"](sum);
`
const deobfuscatedCode = deobfuscate(code)
console.log(deobfuscatedCode)
```
The result:
```javascript
let sum = 0;
for(let i = 0; i < 10; i++) {
  sum += i;
}
console.log(sum);
```