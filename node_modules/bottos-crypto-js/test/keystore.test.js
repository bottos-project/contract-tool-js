const Keystore = require('../lib/keystore')
const assert = require('assert')


describe('keystore file encrypt and decrypt',()=>{
    it('keystore file encrypt',()=>{9
        const ct = Keystore.create({account:'tom',password:"tom123"})
    })

    it('keystore file decrypt to private key',(done)=>{
        const P = new Promise((resolve,reject)=>{
            let params = {account:'tom',password:"tom123"}
            const kstObj = Keystore.create({account:'tom',password:"tom123"})
            const priKey = Keystore.recover(params.password,kstObj).toString('hex')
            resolve(priKey)
        })

        P.then(priKey=>{
            console.log({priKey})
            done();
        }).catch((error)=>{
            console.log(error)
            done()
        })
    })
})




