# btocomponent
   
   wallet and client component repository


# wallet component

   

# public component


# Usage

```
const btcrypto = require('bottos-js-crypto')

// create public key and private key
let keys = btcrypto.createPubPrivateKeys()

//  sign message
let prikey = keys.privateKey
let awesome = require('./awesome_pb')
let msg =  {"version":22,"cursornum":123,"cursor_label":888,"lifetime":124,"sender":"22", "contract":"", "method":"4", "param":[123,34,102,114,111,109,34,58,34,100,101,108,101,103,97,116,101,49,34,44,34,116,111,34,58,34,100,101,108,101,103,97,116,101,50,34,44,34,118,97,108,117,101,34,58,49,48,48,48,48,125], "sig_alg":0, "signature":[]}
let encodeBuf = btcrypto.protobufEncode(awesome,msg)
let hashData = btcrypto.sha256(btcrypto.buf2hex(encodeBuf))
let sign = btcrypto.sign(hashData,prikey)

// // sha256
let hash = btcrypto.sha256("test message")

// keystore
let kst = btcrypto.keystore;
let keystoreObj = kst.create({account:"john",password:"john123"})


// keystore and password decrypto private key
let privateKey = keystore.recover(password,keystoreObj)


```