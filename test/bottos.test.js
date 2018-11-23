const BottosSDK = require('bottos-sdk-js/src')
const {BTPack,BTUnpack} = require('bottos-js-msgpack')
const config = require('../config/config')
const keystore = require('../config/keystore.json')
const SDK = new BottosSDK({
    baseUrl: config.node_config.base_url
});

const Abi = require('../contracts/abi.json')
const {Api,Wallet,Tool,Contract} = SDK
let privateKeyBuf = Wallet.recover(config.keystore_pwd,keystore)
let privateKey = Tool.buf2hex(privateKeyBuf)

describe("test call contract",()=>{
    it('reguser in contract',()=>{
        let originFetchTemplate = {
            sender:keystore.account,
            contract:keystore.account,
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

    it('get user info',()=>{
        let abi = Abi["reguser"]
        Api.request('/common/query',{
            contract:keystore.account,
            object:"users",
            key:keystore.account
        },'POST')
            .then(response=>response.json())
            .then(response=>{
                console.log({response})
                if(response && response.result){
                    let value = response.result.value
                    let buf = Buffer.from(value,'hex')
                    let unpackRes = BTUnpack(buf,abi)
                    console.log({unpackRes})
                }
            })
            .catch(error=>{
                console.log({error})
            })
    })

    it("get user info from contract",()=>{
        let originFetchTemplate = {
            sender:keystore.account,
            contract:keystore.account,
            method:'getuserinfo',
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

    // it('check transaction status',()=>{
    //     Tool.getTransactionInfo('9038bf569d15aa9c69bf55e049de978bb905fe95980eac785132f4081a8a36da')
    //         .then(response=>{
    //             console.log({response})
    //         })
    //         .catch(error=>{
    //             console.log({error})
    //         })
    // })
})
