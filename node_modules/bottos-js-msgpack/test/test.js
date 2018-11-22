const assert = require('assert');
const BSPack = require('../lib/BasicPack')
const BSUnpack = require('../lib/BasicUnpack')
const BTPack = require('../lib/BTPack')
const BTUnpack = require('../lib/BTUnpack')
const Types = require('../lib/Types')
  
  const BIN16 = 0xc5
  const UINT8  = 0xcc
  const UINT16 = 0xcd
  const UINT32 = 0xce
  const UINT64 = 0xcf
  const STR16   = 0xda
  const ARRAY16 = 0xdc
  
describe('pack and unpack',()=>{
    it('Uint8  16',()=>{
        let packUint8 = BSPack.PackUint8(16)
        let unPackUint8 = BSUnpack.UnpackUint8(packUint8)
        console.log({packUint8,unPackUint8})
    })

    it('Uint16  16',()=>{
        let packUint16 = BSPack.PackUint16(16)
        let unPackUint16 = BSUnpack.UnpackUint16(packUint16)
        console.log({packUint16,unPackUint16})
    })

    it('Uint32  199999',()=>{
        let packUint32 = BSPack.PackUint32(199999)
        let unPackUint32 = BSUnpack.UnpackUint32(packUint32)
        console.log({packUint32,unPackUint32})
    })

    it('Uint64 999999999999',()=>{
        let packUint64 = BSPack.PackUint64(999999999999)
        let unPackUint64 = BSUnpack.UnpackUint64(packUint64)
        console.log({packUint64,unPackUint64})
    })

    it('Bin16 99',()=>{
        let buf = BSPack.PackUint32(199999)
        let packBin16 = BSPack.PackBin16(buf)
        let unpackBin16 = BSUnpack.UnpackBin16(packBin16)
        console.log({packBin16,unpackBin16})
    })

    it('str16  abcd',()=>{
        let packStr = BSPack.PackStr16('abcd')
        let unPackStr = BSUnpack.UnpackStr16(packStr)
        console.log({packStr,unPackStr})
    })

    it('packArraySize 499',()=>{
        let packArraySize = BSPack.PackArraySize(499)
        let unPackArraySize = BSUnpack.UnpackArraySize(packArraySize)
        console.log({packArraySize,unPackArraySize})
    })

    it('u256 115792089237316195423570985008687907853269984665640564039457584007913129639934',()=>{
        let num = '115792089237316195423570985008687907853269984665640564039457584007913129639934'
        let packU256 = BSPack.PackUint256(num)
        console.log({packU256})
    })
})


describe('BTPack and BTUnpack',()=>{
    it('Pack',()=>{
        const testObj = {
            to:"bm",
            value:4352,
            from:"jhon",
            contract:{
                name:"dfds",
                sdfkjds:{
                    ksjdfl:"lksdjflds"
                }
            }
        }

        let v1 = BSPack.PackArraySize(4)
        let v2 = BSPack.PackStr16(testObj.to)
        let v3 = BSPack.PackUint32(testObj.value)
        let v4 = BSPack.PackStr16(testObj.from)

        let v5 = BSPack.PackArraySize(2)
        let v6 = BSPack.PackStr16(testObj.contract.name)

        let v7 = BSPack.PackArraySize(1)
        let v8 = BSPack.PackStr16(testObj.contract.sdfkjds.ksjdfl)

        let a1 = [...v5,...v6]
        let a2 = [...v7,...v8]
        

        let arr = []
        arr = arr.concat(...v1,...v2,...v3,...v4,...a1,...a2)
        console.log(...arr)

    })

    it('BTPack and BTUnpack',()=>{
        const transactionAbi = {
            to:{type:Types.string},
            value:{type:Types.uint32},
            from:{type:Types.string},
            contract:{
              type:Types.object,
              name:{type:Types.string},
              sdfkjds:{
                type:Types.object,
                ksjdfl:{type:Types.string}
              }
            }
        }
        
        const testObj = {
            to:"bm",
            value:4352,
            from:"jhon",
            contract:{
                name:"dfds",
                sdfkjds:{
                    ksjdfl:"lksdjflds"
                }
            }
        }

        let packResult = BTPack(testObj,transactionAbi)
        let unPackResult = BTUnpack(packResult,transactionAbi)

        console.log(...packResult)
        console.log({unPackResult:JSON.stringify(unPackResult)})
    })
})