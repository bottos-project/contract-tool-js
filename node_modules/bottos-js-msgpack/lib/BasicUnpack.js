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

const UnpackUint8 = (buf)=>{
    let v1 = buf[1]
    return v1;
}

const UnpackUint16 = (buf)=>{
    let v1 = buf[1] << 8
    let v2 = buf[2]
    return v1+v2
}

const UnpackUint32 = (buf)=>{
    let v1 = buf[1] << 24
    let v2 = buf[2] << 16
    let v3 = buf[3] << 8
    let v4 = buf[4]
    return v1 + v2 + v3 + v4
}

const UnpackUint64 = (buf)=>{
    let v1 = buf[1] << 24
    let v2 = buf[2] << 16
    let v3 = buf[3] << 8
    let v4 = buf[4]
    let h = (v1 + v2 + v3 + v4)<<32

    let v5 = buf[5] << 24
    let v6 = buf[6] << 16
    let v7 = buf[7] << 8
    let v8 = buf[8]
    let l = v5 + v6 + v7 + v8

    // let value = h + l
    let longValue = Long.fromBits(l,h,true)
    let value = longValue.toString()
    return value
}

const UnpackStr16 = (buf)=>{
    let v1 = buf[1] << 8 
    let v2 = buf[2]
    let length = v1 + v2
    let str = ''
    for(let i = 3;i<length+3;i++){
        let s = String.fromCharCode(buf[i])
        str += s
    }
    return str
}

const UnpackBin16 = (buf)=>{
    let v1 = buf[1] << 8
    let v2 = buf[2]
    let length = v1 + v2
    const bytes = []
    for(let i = 3;i<length;i++){
        bytes.push(buf[i])
    }
    return bytes
}

const UnpackArraySize = (buf)=>{
    let v1 = buf[1] << 8
    let v2 = buf[2]
    return  v1 + v2
}

module.exports = {
    UnpackUint8,
    UnpackUint16,
    UnpackUint32,
    UnpackUint64,
    UnpackStr16,
    UnpackBin16,
    UnpackArraySize
}