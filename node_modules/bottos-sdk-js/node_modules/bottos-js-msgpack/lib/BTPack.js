const BSPack = require('./BasicPack')

const BTPack = (obj,abi)=>{
  let keys = Object.keys(obj)
  let size = keys.length
  let packBuf = []
  packBuf = packBuf.concat(Array.from(BSPack.PackArraySize(size)))
  for(let key of keys){
    let keyAbi = abi[key]
    let value = obj[key]
    let type = keyAbi && keyAbi.type
    if(type=='string'){
      // console.log('string')
      packBuf = packBuf.concat(Array.from(BSPack.PackStr16(value)))
    }else if(type=='uint8'){
      // console.log('uint8')
      packBuf = packBuf.concat(Array.from(BSPack.PackUint8(value)))
    }else if(type=='uint16'){
      packBuf = packBuf.concat(Array.from(BSPack.PackUint16(value)))
    }else if(type=='uint32'){
      // console.log('uint32')
      packBuf = packBuf.concat(Array.from(BSPack.PackUint32(value)))
    }else if(type == 'uint64'){
      // console.log('uint64')
      packBuf = packBuf.concat(Array.from(BSPack.PackUint64(value)))
    }else if(type=='uint256'){
      packBuf = packBuf.concat(Array.from(BSPack.PackUint256(value)))
    }else if(type=='array'){
      // console.log('array')
      packBuf = packBuf.concat(Array.from(BSPack.PackBin16(value)))
    }else if(type=='object'){
      // console.log('object')
      packBuf = packBuf.concat(Array.from(BTPack(value,keyAbi)))
    }else{
      console.log('Invalid type')
    }
  } 
  return packBuf
}

module.exports = BTPack
