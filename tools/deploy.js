const BottosSDK = require('bottos-sdk-js/src')
const config = require('../config/config')
const fs = require('fs')
const keystore = require('../config/keystore.json')
var argv = require('yargs').argv;

const SDK = new BottosSDK({
    baseUrl: config.node_config.base_url
});

const Contract = SDK.Contract
const Wallet = SDK.Wallet
const Tool = SDK.Tool

let privateKeyBuf = Wallet.recover(config.keystore_pwd,keystore)
let privateKey = Tool.buf2hex(privateKeyBuf)

const deployContract = ()=>{
    fs.readFile('contracts/contract.js',(error,data)=>{
        if(error){
            throw error
        }else{
            let params = {
                vm_type:2,    // 1:wasm   2:JavaScript
                contract_code:data
            }
            let senderInfo = {
                account:keystore.account,
                privateKey:privateKey
            }
            Contract.deployCode(params,senderInfo)
                .then(response=>{
                    console.log({response})
                })
                .catch(error=>{
                    console.log({error})
                    console.log("deplou failed")
                })
        }
    })
}

const deployAbi = ()=>{
    fs.readFile('contracts/abi.json',(error,data)=>{
        if(error){
            throw error
        }else{
            let params = {
                contract_abi:data,
                filetype:'js'
            }
            let senderInfo = {
                account:keystore.account,
                privateKey:privateKey
            }
            Contract.deployABI(params,senderInfo)
                .then(response=>{
                    console.log({response})
                })
                .catch(error=>{
                    console.log({error})
                    console.log("deplou failed")
                })
        }
    })
}

if(argv.type == 'contract'){
    deployContract()
}else if(argv.type == 'abi'){
    deployAbi()
}
