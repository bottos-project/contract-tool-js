const BottosSDK = require('bottos-sdk-js/src')
const config = require('../config/config')
const keystore = require('../config/keystore.json')
const SDK = new BottosSDK({
    baseUrl: config.node_config.base_url
});
const Api = SDK.Api
const Wallet = SDK.Wallet
const Tool = SDK.Tool
const Contract = SDK.Contract
let privateKeyBuf = Wallet.recover(config.keystore_pwd,keystore)
let privateKey = Tool.buf2hex(privateKeyBuf)

describe("test call contract",()=>{
    it('reguser',()=>{
        let originFetchTemplate = {
            sender:keystore.account,
            contract:'bottostest',
            method:'reguser',
            param:{
                account:keystore.account,
                age:18,
                height:32
            },
            version:1,
            sig_alg:1
        }
        Contract.callContract(originFetchTemplate,privateKey)
            .then(response=>{
                console.log({response})
            })
            .catch(error=>{
                console.log({error})
            })
    })

    it('check deploy status',()=>{
        Tool.getTransactionInfo('9db3ea347d116a1de83f058c13340b4698340ab29c97d838a2e930503e880261')
            .then(response=>{
                console.log({response})
            })
            .catch(error=>{
                console.log({error})
            })
    })
})