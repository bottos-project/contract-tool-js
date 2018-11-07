const crypto = require('crypto')
const eccrypto = require('eccrypto')
const secp256k1 = require('secp256k1')
const scrypt = require('./scrypt')
const keccak = require('keccak')
const uuid = require('uuid')
var createKeccakHash = require("keccak/js");

function isFunction(f) {
    return typeof f === "function";
}

function keccak256(buffer) {
    return createKeccakHash("keccak256").update(buffer).digest();
}

class Keystore{
    constructor(){
        this.crypto = crypto
        this.scrypt = scrypt
        this.constants = {
            // Suppress logging
            quiet: false,

            // Symmetric cipher for private key encryption
            cipher: "aes-128-ctr",

            // Initialization vector size in bytes
            ivBytes: 16,

            // ECDSA private key size in bytes
            keyBytes: 32,

            // Key derivation function parameters
            pbkdf2: {
                c: 262144,
                dklen: 32,
                hash: "sha256",
                prf: "hmac-sha256"
            },
            scrypt: {
                memory: 280000000,
                dklen: 32,
                n: 262144,
                r: 1,
                p: 8
            }
        }
    }

    create(params){
      let account = params.account;
      let password = params.password;
      if(typeof account === 'undefined' || account===null){
        throw new Error('Must provide account and password')
      }

      if (typeof password === "undefined" || password === null) {
        throw new Error("Must provide password and salt to derive a key");
      }

      const ct = this.createKeyInfo(params)
      const privateKey = params.privateKey || ct.privateKey;
      return this.dump(account,password,privateKey,ct.salt,ct.iv)
    }

    str2buf(str, enc){
        if (!str || str.constructor !== String) return str;
        if (!enc && this.isHex(str)) enc = "hex";
        if (!enc && this.isBase64(str)) enc = "base64";
        return Buffer.from(str, enc);
    }

    isHex(str){
        if (str.length % 2 === 0 && str.match(/^[0-9a-f]+$/i)) return true;
        return false;
    }

    isBase64(str){
        var index;
        if (str.length % 4 > 0 || str.match(/[^0-9a-z+\/=]/i)) return false;
        index = str.indexOf("=");
        if (index === -1 || str.slice(index).match(/={1,2}/)) return true;
        return false;
    }

    isCipherAvailable(cipher){
        return crypto.getCiphers().some(function (name) { return name === cipher; });
    }

    keccak256(){
        return keccak("keccak256").update(buffer).digest();
    }

    createKeys(){
        let privateKey = crypto.randomBytes(32)
        let publicKey = eccrypto.getPublic(privateKey)
        return {privateKey,publicKey}
    }

    createKeyInfo(params){
        var keyBytes, ivBytes, self = this;
        params = params || {};
        keyBytes = params.keyBytes || this.constants.keyBytes;
        ivBytes = params.ivBytes || this.constants.ivBytes;
    
        function checkBoundsAndCreateObject(randomBytes) {
          var privateKey = randomBytes.slice(0, keyBytes);
          if (!secp256k1.privateKeyVerify(privateKey)) return self.create(params, cb);
          return {
            privateKey: params.privateKey || privateKey,
            iv: randomBytes.slice(keyBytes, keyBytes + ivBytes),
            salt: randomBytes.slice(keyBytes + ivBytes)
          };
        }

        // synchronous key generation if callback not provided
        return checkBoundsAndCreateObject(crypto.randomBytes(keyBytes + ivBytes + keyBytes));
    }

    encrypt(plaintext, key, iv, algo){
        var cipher, ciphertext;
        algo = algo || this.constants.cipher;
        if (!this.isCipherAvailable(algo)) throw new Error(algo + " is not available");
        cipher = crypto.createCipheriv(algo, this.str2buf(key), this.str2buf(iv));
        ciphertext = cipher.update(this.str2buf(plaintext));
        return Buffer.concat([ciphertext, cipher.final()]);
    }

    decrypt(ciphertext, key, iv, algo){
        var decipher, plaintext;
        algo = algo || this.constants.cipher;
        if (!this.isCipherAvailable(algo)) throw new Error(algo + " is not available");
        decipher = crypto.createDecipheriv(algo, this.str2buf(key), this.str2buf(iv));
        plaintext = decipher.update(this.str2buf(ciphertext));
        return Buffer.concat([plaintext, decipher.final()]);
    }

    privateKeyToAddress(privateKey){
        var privateKeyBuffer, publicKey;
        privateKeyBuffer = this.str2buf(privateKey);
        if (privateKeyBuffer.length < 32) {
          privateKeyBuffer = Buffer.concat([
            Buffer.alloc(32 - privateKeyBuffer.length, 0),
            privateKeyBuffer
          ]);
        }
        publicKey = secp256k1.publicKeyCreate(privateKeyBuffer, false).slice(1);
        return "0x" + keccak256(publicKey).slice(-20).toString("hex");
    }

    getMAC(derivedKey, ciphertext){
        if (derivedKey !== undefined && derivedKey !== null && ciphertext !== undefined && ciphertext !== null) {
            return keccak256(Buffer.concat([
              this.str2buf(derivedKey).slice(16, 32),
              this.str2buf(ciphertext)
            ])).toString("hex");
          }
    }

    deriveKey(password, salt, options, cb){
        var prf, self = this;
        if (typeof password === "undefined" || password === null || !salt) {
          throw new Error("Must provide password and salt to derive a key");
        }
    
        options = options || {};
        options.kdfparams = options.kdfparams || {};
    
        // convert strings to buffers
        password = this.str2buf(password, "utf8");
        salt = this.str2buf(salt);
    
        // use scrypt as key derivation function
          if (isFunction(this.scrypt)) {
            this.scrypt = this.scrypt(options.kdfparams.memory || self.constants.scrypt.memory);
          }
          if (isFunction(cb)) {
            setTimeout(function () {
              cb(Buffer.from(scrypt.to_hex(scrypt.crypto_scrypt(
                password,
                salt,
                options.kdfparams.n || self.constants.scrypt.n,
                options.kdfparams.r || self.constants.scrypt.r,
                options.kdfparams.p || self.constants.scrypt.p,
                options.kdfparams.dklen || self.constants.scrypt.dklen
              )), "hex"));
            }, 0);
          } else {
            return Buffer.from(this.scrypt.to_hex(this.scrypt.crypto_scrypt(
              password,
              salt,
              options.kdfparams.n || this.constants.scrypt.n,
              options.kdfparams.r || this.constants.scrypt.r,
              options.kdfparams.p || this.constants.scrypt.p,
              options.kdfparams.dklen || this.constants.scrypt.dklen
            )), "hex");
          }
    }

    marshal(derivedKey,account, privateKey, salt, iv, options){
        var ciphertext, keyObject, algo;
        options = options || {};
        options.kdfparams = options.kdfparams || {};
        algo = options.cipher || this.constants.cipher;
    
        // encrypt using first 16 bytes of derived key
        ciphertext = this.encrypt(privateKey, derivedKey.slice(0, 16), iv, algo).toString("hex");
    
        keyObject = {
          account:account,
          crypto: {
            cipher: options.cipher || this.constants.cipher,
            ciphertext: ciphertext,
            cipherparams: { iv: iv.toString("hex") },
            mac: this.getMAC(derivedKey, ciphertext)
          },
          id: uuid.v4(), // random 128-bit UUID
          version: 3
        };
    
        keyObject.crypto.kdf = "scrypt";
        keyObject.crypto.kdfparams = {
          dklen: options.kdfparams.dklen || this.constants.scrypt.dklen,
          n: options.kdfparams.n || this.constants.scrypt.n,
          r: options.kdfparams.r || this.constants.scrypt.r,
          p: options.kdfparams.p || this.constants.scrypt.p,
          salt: salt.toString("hex")
        };
    
        return keyObject;
    }

    dump(account,password, privateKey, salt, iv, options, cb){
        options = options || {};
        iv = this.str2buf(iv);
        privateKey = this.str2buf(privateKey);

        // synchronous if no callback provided
        if (!isFunction(cb)) {
        return this.marshal(this.deriveKey(password, salt, options),account, privateKey, salt, iv, options);
        }

        // asynchronous if callback provided
        this.deriveKey(password, salt, options, function (derivedKey) {
        cb(this.marshal(derivedKey,account, privateKey, salt, iv, options));
        }.bind(this));
    }

    recover(password, keyObject, cb){
        var keyObjectCrypto, iv, salt, ciphertext, algo, self = this;
        keyObjectCrypto = keyObject.Crypto || keyObject.crypto;
    
        // verify that message authentication codes match, then decrypt
        function verifyAndDecrypt(derivedKey, salt, iv, ciphertext, algo) {
          var key;
          if (self.getMAC(derivedKey, ciphertext) !== keyObjectCrypto.mac) {
            throw new Error("message authentication code mismatch");
          }
          if (keyObject.version === "1") {
            key = keccak256(derivedKey.slice(0, 16)).slice(0, 16);
          } else {
            key = derivedKey.slice(0, 16);
          }
          return self.decrypt(ciphertext, key, iv, algo);
        }
    
        iv = this.str2buf(keyObjectCrypto.cipherparams.iv);
        salt = this.str2buf(keyObjectCrypto.kdfparams.salt);
        ciphertext = this.str2buf(keyObjectCrypto.ciphertext);
        algo = keyObjectCrypto.cipher;
    
        if (keyObjectCrypto.kdf === "pbkdf2" && keyObjectCrypto.kdfparams.prf !== "hmac-sha256") {
          throw new Error("PBKDF2 only supported with HMAC-SHA256");
        }
    
        // derive secret key from password
        if (!isFunction(cb)) {
          return verifyAndDecrypt(this.deriveKey(password, salt, keyObjectCrypto), salt, iv, ciphertext, algo);
        }
        this.deriveKey(password, salt, keyObjectCrypto, function (derivedKey) {
          cb(verifyAndDecrypt(derivedKey, salt, iv, ciphertext, algo));
        });
    }
}

module.exports = new Keystore()