"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.generateTaprootAddressFromPubKey = exports.decryptWallet = exports.encryptWallet = exports.getBitcoinKeySignContent = exports.importBTCPrivateKey = exports.getBTCBalance = exports.generateP2PKHKeyFromRoot = exports.generateP2PKHKeyPair = exports.generateTaprootKeyPair = exports.generateTaprootAddress = exports.tapTweakHash = exports.tweakSigner = exports.toXOnly = exports.convertPrivateKeyFromStr = exports.convertPrivateKey = exports.ECPair = exports.mnemonicToTaprootPrivateKey = exports.MAINNET_DERIV_PATH = exports.TESTNET_DERIV_PATH = exports.NETWORK = void 0;
var ecc = require("@bitcoinerlab/secp256k1");
var bitcoin = require("bitcoinjs-lib");
var bitcoinjs_lib_1 = require("bitcoinjs-lib");
var bip39_1 = require("bip39");
var crypto_js_1 = require("crypto-js");
var ecpair_1 = require("ecpair");
var bip32_1 = require("bip32");
var network_1 = require("./network");
var selectcoin_1 = require("./selectcoin");
var wif_1 = require("wif");
(0, bitcoinjs_lib_1.initEccLib)(ecc);
var ECPair = (0, ecpair_1.ECPairFactory)(ecc);
exports.ECPair = ECPair;
var BTCSegwitWalletDefaultPath = "m/84'/0'/0'/0/0";
exports.NETWORK = bitcoin.networks.testnet;
exports.TESTNET_DERIV_PATH = "m/86'/0'/0'/0/0";
exports.MAINNET_DERIV_PATH = "m/86'/0'/0'/0/0";
var mnemonicToTaprootPrivateKey = function (mnemonic, testnet) {
    if (testnet === void 0) { testnet = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var bip32, seed, rootKey, derivePath, taprootChild;
        return __generator(this, function (_a) {
            bip32 = (0, bip32_1["default"])(ecc);
            (0, bitcoinjs_lib_1.initEccLib)(ecc);
            seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic);
            rootKey = bip32.fromSeed(seed, testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);
            derivePath = testnet ? exports.TESTNET_DERIV_PATH : exports.MAINNET_DERIV_PATH;
            taprootChild = rootKey.derivePath(derivePath);
            return [2 /*return*/, taprootChild.privateKey];
        });
    });
};
exports.mnemonicToTaprootPrivateKey = mnemonicToTaprootPrivateKey;
/**
* convertPrivateKey converts buffer private key to WIF private key string
* @param bytes buffer private key
* @returns the WIF private key string
*/
var convertPrivateKey = function (bytes) {
    return wif_1["default"].encode(128, bytes, true);
};
exports.convertPrivateKey = convertPrivateKey;
/**
* convertPrivateKeyFromStr converts private key WIF string to Buffer
* @param str private key string
* @returns buffer private key
*/
var convertPrivateKeyFromStr = function (str) {
    var res = wif_1["default"].decode(str);
    return res === null || res === void 0 ? void 0 : res.privateKey;
};
exports.convertPrivateKeyFromStr = convertPrivateKeyFromStr;
function toXOnly(pubkey) {
    return pubkey.subarray(1, 33);
}
exports.toXOnly = toXOnly;
function tweakSigner(signer, opts) {
    if (opts === void 0) { opts = {}; }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    var privateKey = signer.privateKey;
    if (!privateKey) {
        throw new Error("Private key is required for tweaking signer!");
    }
    if (signer.publicKey[0] === 3) {
        privateKey = ecc.privateNegate(privateKey);
    }
    var tweakedPrivateKey = ecc.privateAdd(privateKey, tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash));
    if (!tweakedPrivateKey) {
        throw new Error("Invalid tweaked private key!");
    }
    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network
    });
}
exports.tweakSigner = tweakSigner;
function tapTweakHash(pubKey, h) {
    return bitcoinjs_lib_1.crypto.taggedHash("TapTweak", Buffer.concat(h ? [pubKey, h] : [pubKey]));
}
exports.tapTweakHash = tapTweakHash;
var generateTaprootAddress = function (privateKey) {
    var keyPair = ECPair.fromPrivateKey(privateKey, { network: network_1.Network });
    var internalPubkey = toXOnly(keyPair.publicKey);
    var address = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: internalPubkey,
        network: network_1.Network
    }).address;
    return address ? address : "";
};
exports.generateTaprootAddress = generateTaprootAddress;
var generateTaprootAddressFromPubKey = function (pubKey) {
    // const internalPubkey = toXOnly(pubKey);
    var internalPubkey = pubKey;
    var p2pktr = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: internalPubkey,
        network: network_1.Network
    });
    return { address: p2pktr.address || "", p2pktr: p2pktr };
};
exports.generateTaprootAddressFromPubKey = generateTaprootAddressFromPubKey;
var generateTaprootKeyPair = function (privateKey) {
    // init key pair from senderPrivateKey
    var keyPair = ECPair.fromPrivateKey(privateKey, { network: network_1.Network });
    // Tweak the original keypair
    var tweakedSigner = tweakSigner(keyPair, { network: network_1.Network });
    // Generate an address from the tweaked public key
    var p2pktr = bitcoinjs_lib_1.payments.p2tr({
        pubkey: toXOnly(tweakedSigner.publicKey),
        network: network_1.Network
    });
    var senderAddress = p2pktr.address ? p2pktr.address : "";
    if (senderAddress === "") {
        throw new Error("Can not get sender address from private key");
    }
    return { keyPair: keyPair, senderAddress: senderAddress, tweakedSigner: tweakedSigner, p2pktr: p2pktr };
};
exports.generateTaprootKeyPair = generateTaprootKeyPair;
var generateP2PKHKeyPair = function (privateKey) {
    // init key pair from senderPrivateKey
    var keyPair = ECPair.fromPrivateKey(privateKey, { network: network_1.Network });
    // Generate an address from the tweaked public key
    var p2pkh = bitcoinjs_lib_1.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: network_1.Network
    });
    var address = p2pkh.address ? p2pkh.address : "";
    if (address === "") {
        throw new Error("Can not get sender address from private key");
    }
    return { keyPair: keyPair, address: address, p2pkh: p2pkh, privateKey: privateKey };
};
exports.generateP2PKHKeyPair = generateP2PKHKeyPair;
var generateP2PKHKeyFromRoot = function (root) {
    var childSegwit = root.derivePath(BTCSegwitWalletDefaultPath);
    var privateKey = childSegwit.privateKey;
    return generateP2PKHKeyPair(privateKey);
};
exports.generateP2PKHKeyFromRoot = generateP2PKHKeyFromRoot;
/**
* getBTCBalance returns the Bitcoin balance from cardinal utxos.
*/
var getBTCBalance = function (params) {
    var utxos = params.utxos, inscriptions = params.inscriptions;
    var totalCardinalAmount = (0, selectcoin_1.filterAndSortCardinalUTXOs)(utxos, inscriptions).totalCardinalAmount;
    return totalCardinalAmount;
};
exports.getBTCBalance = getBTCBalance;
/**
* importBTCPrivateKey returns the bitcoin private key and the corresponding taproot address.
*/
var importBTCPrivateKey = function (wifPrivKey) {
    var privKeyBuffer = convertPrivateKeyFromStr(wifPrivKey);
    var senderAddress = generateTaprootKeyPair(privKeyBuffer).senderAddress;
    return {
        taprootPrivKeyBuffer: privKeyBuffer,
        taprootAddress: senderAddress
    };
};
exports.importBTCPrivateKey = importBTCPrivateKey;
var getBitcoinKeySignContent = function (message) {
    return Buffer.from(message);
};
exports.getBitcoinKeySignContent = getBitcoinKeySignContent;
/**
* encryptWallet encrypts Wallet object by AES algorithm.
* @param wallet includes the plaintext private key need to encrypt
* @param password the password to encrypt
* @returns the signature with prefix "0x"
*/
var encryptWallet = function (wallet, password) {
    // convert wallet to string
    var walletStr = JSON.stringify(wallet);
    return crypto_js_1.AES.encrypt(walletStr, password).toString();
};
exports.encryptWallet = encryptWallet;
/**
* decryptWallet decrypts ciphertext to Wallet object by AES algorithm.
* @param ciphertext ciphertext
* @param password the password to decrypt
* @returns the Wallet object
*/
var decryptWallet = function (ciphertext, password) {
    var plaintextBytes = crypto_js_1.AES.decrypt(ciphertext, password);
    // parse to wallet object
    var wallet = JSON.parse(plaintextBytes.toString(crypto_js_1.enc.Utf8));
    return wallet;
};
exports.decryptWallet = decryptWallet;
