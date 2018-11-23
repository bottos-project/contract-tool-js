/*
  Copyright 2017~2022 The Bottos Authors
  This file is part of the Bottos Data Exchange Client
  Created by Developers Team of Bottos.

  This program is free software: you can distribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Bottos. If not, see <http://www.gnu.org/licenses/>.
*/
const Long = require('long')
const BigNumber = require('bignumber.js')

const BIN16 = 0xc5  //197
const UINT8  = 0xcc  //204
const UINT16 = 0xcd  //205
const UINT32 = 0xce  //206
const UINT64 = 0xcf  //207
const STR16   = 0xda  //218
const ARRAY16 = 0xdc  //220

const LEN_INT32 = 4
const LEN_INT64 = 8

const MAX16BIT = 2 << (16 - 1)

const REGULAR_UINT7_MAX  = 2 << (7 - 1)
const REGULAR_UINT8_MAX  = 2 << (8 - 1)
const REGULAR_UINT16_MAX = 2 << (16 - 1)
const REGULAR_UINT32_MAX = 2 << (32 - 1)

const SPECIAL_INT8  = 32
const SPECIAL_INT16 = 2 << (8 - 2)
const SPECIAL_INT32 = 2 << (16 - 2)
const SPECIAL_INT64 = 2 << (32 - 2)

const PackUint8 = (value)=>{
    const buf = new Uint8Array(2)
    buf[0]=UINT8;
    buf[1]=value;
    return buf
}

const PackUint16 = (value)=>{
    const buf = new Uint8Array(3)
    buf[0]=UINT16
    buf[1]=value>>8
    buf[2]=value
    return buf
}

const PackUint32 = (value)=>{
    const buf = new Uint8Array(5)
    buf[0]=UINT32
    buf[1]=value>>24
    buf[2]=value>>16
    buf[3]=value>>8
    buf[4]=value
    return buf
}

const PackUint64 = (n)=>{
  let num = Long.fromNumber(Number(n))
  let h = num.getHighBitsUnsigned()
  let l = num.getLowBitsUnsigned()

  const buf = new Uint8Array(9)
  buf[0]=UINT64
  buf[1]=h>>24
  buf[2]=h>>16
  buf[3]=h>>8
  buf[4]=h

  buf[5]=l>>24
  buf[6]=l>>16
  buf[7]=l>>8
  buf[8]=l
  return buf
}

const PackUint256 = (num)=>{
  let bigNumber = new BigNumber(num)
  let hexNumber = bigNumber.toString(16)
  let hexNumberArr = hexNumber.split('')
  let hexLength = hexNumber.length
  let zeroLength = 64 - hexLength
  let zeroArr = Array.from(new Array(zeroLength),(val,index)=>0)  // 前面补0
  let dataArr = [...zeroArr,...hexNumberArr]

  let result = arrayChunk(dataArr,2)
  let arrayBuf = new ArrayBuffer(32)
  for(let j = 0;j<result.length;j++){
    arrayBuf[j] = result[j]
  }
  let arrbuf = PackBin16(arrayBuf)
  let length = arrbuf.byteLength
  let buf = new Uint8Array(length)
  for(let i = 0;i<length;i++){
    buf[i] = arrbuf[i]
  }

  return buf
}

const PackBin16 = (byteArray)=>{
  let byteLen = byteArray.byteLength
  let len = byteLen + 3
  let bytes = new ArrayBuffer(len)
  bytes[0] = BIN16
  bytes[1] = byteLen>>8
  bytes[2] = byteLen
  for(let i = 0;i<byteLen;i++){
    bytes[i+3] = byteArray[i]
  }
  return bytes
}

const PackStr16 = (str)=>{
  str = convertUnicode2Utf8(str)
  let len = str.length
  let byteLen = len + 3
  let bytes = new Uint8Array(byteLen)
  bytes[0] = STR16
  bytes[1] = len >> 8
  bytes[2] = len
  for(let i = 0;i<len;i++){
    bytes[i+3] = str[i]
  }
  return bytes
}

const PackArraySize = (length)=>{
  let size = new Uint8Array(3)
  size[0] = ARRAY16
  size[1] = length>>8
  size[2] = length
  return size
}

const convertUnicode2Utf8 = (str,isGetBytes=true)=>{
  var back = [];
  var byteSize = 0;
  for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (0x00 <= code && code <= 0x7f) {
            byteSize += 1;
            back.push(code);
      } else if (0x80 <= code && code <= 0x7ff) {
            byteSize += 2;
            back.push((192 | (31 & (code >> 6))));
            back.push((128 | (63 & code)))
      } else if ((0x800 <= code && code <= 0xd7ff)
              || (0xe000 <= code && code <= 0xffff)) {
            byteSize += 3;
            back.push((224 | (15 & (code >> 12))));
            back.push((128 | (63 & (code >> 6))));
            back.push((128 | (63 & code)))
      }
    }
    for (i = 0; i < back.length; i++) {
        back[i] &= 0xff;
    }
    if (isGetBytes) {
        return back
    }
    if (byteSize <= 0xff) {
        return [0, byteSize].concat(back);
    } else {
        return [byteSize >> 8, byteSize & 0xff].concat(back);
    }
}

// 将数组每两个元素组成一个新的字符串作为一个元素存储
const arrayChunk = (dataArr,colomns)=>{
  const result = []
  for( var i = 0, len = dataArr.length; i < len; i += colomns ) {
    let tempArr = dataArr.slice(i,i+colomns)
    let tempStr = tempArr.join('')
    result.push(Number.parseInt(tempStr,16))
  }
  return result
}

module.exports = {
  PackUint8,
  PackUint16,
  PackUint32,
  PackUint64,
  PackBin16,
  PackStr16,
  PackArraySize,
  PackUint256
}
