"use strict";

var crypto = require("crypto");
var eccrypto = require("eccrypto");
var protobuf = require("google-protobuf");
var secp256k1 = require('secp256k1');
var keystore = require('./lib/keystore');

/**
 * create private key
 */
var createPrivateKey = function createPrivateKey() {
    return crypto.randomBytes(32);
};

/**
 *  create public key from private key 
 * @param {* buffer} privateKey 
 */
var privateKey2pubKey = function privateKey2pubKey(privateKey) {
    return eccrypto.getPublic(privateKey);
};

/**
 * create public key and private key
 */
var createPubPrivateKeys = function createPubPrivateKeys() {
    var privateKey = crypto.randomBytes(32);
    var publicKey = eccrypto.getPublic(privateKey);

    return { privateKey: privateKey, publicKey: publicKey };
};

/**
 * create proto buffer by protojs and json message
 * @param {*proto file in javascript} protojs 
 * @param {* JSON Object} msg message for sign
 */
var protobufEncode = function protobufEncode(protojs, msg) {
    var ProtoMsg = new protojs.Message();

    ProtoMsg.setVersion(msg.version);
    ProtoMsg.setCursorNum(msg.cursor_num);
    ProtoMsg.setCursorLabel(msg.cursor_label);
    ProtoMsg.setLifetime(msg.lifetime);
    ProtoMsg.setSender(msg.sender);
    ProtoMsg.setContract(msg.contract);
    ProtoMsg.setMethod(msg.method);
    ProtoMsg.setParam(msg.param);
    ProtoMsg.setSigAlg(msg.sig_alg);
    ProtoMsg.setSignature(msg.signature);

    return ProtoMsg.serializeBinary();
};

/**
 * sign message
 * @param {* string} msg sign message 
 * @param {*} privateKey privateKey
 */
var sign = function sign(msg, privateKey) {
    var signObj = secp256k1.sign(msg, privateKey);
    return signObj.signature;
};

/**
 * verify the public key
 * @param {* buffer} privateKey 
 * @param {* buffer } pubKey 
 */
var isPublicKey = function isPublicKey(privateKey, pubKey) {
    var publicKey = eccrypto.getPublic(privateKey);
    return publicKey.toString('hex') == pubKey.toString('hex');
};

/**
 * verify the sign and signed message
 * @param {* buffer} protoEncode proto encode buffer
 * @param {* buffer} sign sign buffer
 * @param {* buffer} publicKey private key
 */
var verify = function verify(protoEncode, sign, publicKey) {
    var msg = crypto.createHash("sha256").update(buf2hex(protoEncode.buffer)).digest();
    return secp256k1.verify(msg, sign, publicKey);
};

/**
 * aes encrypto
 * @param {* string} message 
 * @param {* string} secretKey 
 */
var aesEncrypto = function aesEncrypto(message, secretKey) {
    return cryptojs.AES.encrypt(message, secretKey);
};

/**
 * aes decrypto
 * @param {* buffer} aesSecretMessage 
 * @param {* string} secretKey 
 */
var aesDecrypto = function aesDecrypto(aesSecretMessage, secretKey) {
    var bytes = cryptojs.AES.decrypt(aesSecretMessage, secretKey);
    var plaintext = bytes.toString(cryptojs.enc.Utf8);
    return plaintext;
};

/**
 * buffer type to string
 * @param {* buffer} buffer 
 */
var buf2hex = function buf2hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (x) {
        return ('00' + x.toString(16)).slice(-2);
    }).join('');
};

var sha256 = function sha256(msg) {
    return crypto.createHash("sha256").update(msg).digest();
};

module.exports = {
    createPubPrivateKeys: createPubPrivateKeys,
    isPublicKey: isPublicKey,
    privateKey2pubKey: privateKey2pubKey,
    protobufEncode: protobufEncode,
    sign: sign,
    verify: verify,
    aesEncrypto: aesEncrypto,
    aesDecrypto: aesDecrypto,
    buf2hex: buf2hex,
    sha256: sha256,
    keystore: keystore
};
