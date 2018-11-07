
const assert = require('assert')
const bt_crypto = require('../')

// protoc --js_out=import_style=commonjs,binary:. awesome.proto

describe('create keys and sign',()=>{
    it('createPubPrivateKeys',()=>{
        let keys = bt_crypto.createPubPrivateKeys()
        assert(keys)
        console.log({
            pubKey:keys.publicKey.toString('hex'),
            priKey:keys.privateKey.toString('hex')
        })
    })

    it('encode message to protobuf',()=>{
        let awwsome = require('./awesome_pb')
        let msg = {"version":22,"cursor_num":123,"cursor_label":888,"lifetime":124,"sender":"22", "contract":"", "method":"4", "param":[123,34,102,114,111,109,34,58,34,100,101,108,101,103,97,116,101,49,34,44,34,116,111,34,58,34,100,101,108,101,103,97,116,101,50,34,44,34,118,97,108,117,101,34,58,49,48,48,48,48,125], "sig_alg":0, "signature":[]}
        let encodeBuf = bt_crypto.protobufEncode(awwsome,msg)
        assert(encodeBuf)
        console.log(bt_crypto.buf2hex(encodeBuf))
    })

    it('sign',()=>{
        // create private key
        let keys = bt_crypto.createPubPrivateKeys()
        let priKey = keys.privateKey

        // encode message to protobuf
        let awwsome = require('./awesome_pb')
        let msg = {"version":22,"cursornum":123,"cursor_label":888,"lifetime":124,"sender":"22", "contract":"", "method":"4", "param":[123,34,102,114,111,109,34,58,34,100,101,108,101,103,97,116,101,49,34,44,34,116,111,34,58,34,100,101,108,101,103,97,116,101,50,34,44,34,118,97,108,117,101,34,58,49,48,48,48,48,125], "sig_alg":0, "signature":[]}
        let encodeBuf = bt_crypto.protobufEncode(awwsome,msg)
        
        // hash
        let hashData = bt_crypto.sha256(bt_crypto.buf2hex(encodeBuf))

        // sign
        let sign = bt_crypto.sign(hashData,priKey)

        console.log({sign:sign.toString('hex')})
    })

    it('sha256',()=>{
        let hash = bt_crypto.sha256('test message')
        console.log({sha256:hash.toString('hex')})
    })
})