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
exports.signPSBT2 = exports.signPSBT = exports.createRawTxToPrepareUTXOsToBuyMultiInscs = exports.prepareUTXOsToBuyMultiInscriptions = exports.createRawTxSendBTC = exports.createTxSendBTC = exports.createRawTxDummyUTXOFromCardinal = exports.createDummyUTXOFromCardinal = exports.createRawTxSplitFundFromOrdinalUTXO = exports.createTxSplitFundFromOrdinalUTXO = exports.createRawTxDummyUTXOForSale = exports.createTxWithSpecificUTXOs = exports.broadcastTx = exports.createRawTx = exports.createTx = exports.selectUTXOs = void 0;
var constants_1 = require("./constants");
var wallet_1 = require("./wallet");
var bitcoinjs_lib_1 = require("bitcoinjs-lib");
var error_1 = require("../constants/error");
var axios_1 = require("axios");
var utils_1 = require("./utils");
var selectcoin_1 = require("./selectcoin");
exports.selectUTXOs = selectcoin_1.selectUTXOs;
var bignumber_js_1 = require("bignumber.js");
var network_1 = require("./network");
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
var signPSBT = function (_a) {
    var senderPrivateKey = _a.senderPrivateKey, psbtB64 = _a.psbtB64, indicesToSign = _a.indicesToSign, _b = _a.sigHashType, sigHashType = _b === void 0 ? bitcoinjs_lib_1.Transaction.SIGHASH_DEFAULT : _b;
    // parse psbt string 
    var rawPsbt = bitcoinjs_lib_1.Psbt.fromBase64(psbtB64);
    // init key pair and tweakedSigner from senderPrivateKey
    var tweakedSigner = (0, wallet_1.generateTaprootKeyPair)(senderPrivateKey).tweakedSigner;
    var _loop_1 = function (i) {
        if (indicesToSign.findIndex(function (value) { return value === i; }) !== -1) {
            rawPsbt.signInput(i, tweakedSigner, [sigHashType]);
        }
    };
    // sign inputs
    for (var i = 0; i < rawPsbt.txInputs.length; i++) {
        _loop_1(i);
    }
    var _loop_2 = function (i) {
        if (indicesToSign.findIndex(function (value) { return value === i; }) !== -1) {
            rawPsbt.finalizeInput(i);
        }
    };
    // finalize inputs
    for (var i = 0; i < rawPsbt.txInputs.length; i++) {
        _loop_2(i);
    }
    // extract psbt to get msgTx
    var msgTx = rawPsbt.extractTransaction();
    return {
        signedBase64PSBT: rawPsbt.toBase64(),
        msgTx: msgTx,
        msgTxHex: msgTx.toHex(),
        msgTxID: msgTx.getId()
    };
};
exports.signPSBT = signPSBT;
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
var signPSBT2 = function (_a) {
    var senderPrivateKey = _a.senderPrivateKey, psbtB64 = _a.psbtB64, indicesToSign = _a.indicesToSign, _b = _a.sigHashType, sigHashType = _b === void 0 ? bitcoinjs_lib_1.Transaction.SIGHASH_DEFAULT : _b;
    // parse psbt string 
    var rawPsbt = bitcoinjs_lib_1.Psbt.fromBase64(psbtB64);
    // init key pair and tweakedSigner from senderPrivateKey
    var tweakedSigner = (0, wallet_1.generateTaprootKeyPair)(senderPrivateKey).tweakedSigner;
    // sign inputs
    for (var i = 0; i < rawPsbt.txInputs.length; i++) {
        // if (indicesToSign.findIndex(value => value === i) !== -1) {
        try {
            rawPsbt.signInput(i, tweakedSigner, [sigHashType]);
        }
        catch (e) {
            console.log("Sign index error: ", i, e);
        }
        // }
    }
    // finalize inputs
    for (var i = 0; i < rawPsbt.txInputs.length; i++) {
        // if (indicesToSign.findIndex(value => value === i) !== -1) {
        try {
            rawPsbt.finalizeInput(i);
        }
        catch (e) {
            console.log("Finalize index error: ", i, e);
        }
        // }
    }
    // extract psbt to get msgTx
    // const msgTx = rawPsbt.extractTransaction();
    console.log("hex psbt: ", rawPsbt.toHex());
    return rawPsbt.toBase64();
};
exports.signPSBT2 = signPSBT2;
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
// const signMsgTx = (
//     {
//         senderPrivateKey, hexMsgTx, indicesToSign, sigHashType = Transaction.SIGHASH_DEFAULT
//     }: {
//         senderPrivateKey: Buffer,
//         hexMsgTx: string,
//         indicesToSign?: number[],
//         sigHashType?: number,
//     }
// ): ISignPSBTResp => {
//     // parse msgTx string 
//     const psbt = Psbt.fromHex(hexMsgTx);
//     for (const input of msgTx.ins) {
//         // TODO
//         psbt.addInput({
//             ...input
//         });
//     }
//     for (const output of msgTx.outs) {
//         // TODO
//         psbt.addOutput({
//             ...output
//         });
//     }
//     // init key pair and tweakedSigner from senderPrivateKey
//     const { tweakedSigner } = generateTaprootKeyPair(senderPrivateKey);
//     // sign inputs
//     for (let i = 0; i < msgTx.ins.length; i++) {
//         // if (indicesToSign.findIndex(value => value === i) !== -1) {
//         // msgTx.ins[i](i, tweakedSigner, [sigHashType]);
//         psbt.signInput(i, tweakedSigner);
//         // }
//     }
//     // finalize inputs
//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         // if (indicesToSign.findIndex(value => value === i) !== -1) {
//         psbt.finalizeInput(i);
//         // }
//     }
//     // extract psbt to get msgTx
//     const finalMsgTx = psbt.extractTransaction();
//     return {
//         signedBase64PSBT: psbt.toBase64(),
//         msgTx: finalMsgTx,
//         msgTxHex: finalMsgTx.toHex(),
//         msgTxID: finalMsgTx.getId(),
//     };
// };
var createRawTxDummyUTXOForSale = function (_a) {
    var pubKey = _a.pubKey, utxos = _a.utxos, inscriptions = _a.inscriptions, sellInscriptionID = _a.sellInscriptionID, feeRatePerByte = _a.feeRatePerByte;
    // select dummy UTXO 
    // if there is no dummy UTXO, we have to create raw tx to split dummy UTXO
    var dummyUTXORes;
    var selectedUTXOs = [];
    var splitPsbtB64 = "";
    var indicesToSign = [];
    var newValueInscriptionRes = constants_1.BNZero;
    try {
        // create dummy UTXO from cardinal UTXOs
        var res = createRawTxDummyUTXOFromCardinal(pubKey, utxos, inscriptions, feeRatePerByte);
        dummyUTXORes = res.dummyUTXO;
        selectedUTXOs = res.selectedUTXOs;
        splitPsbtB64 = res.splitPsbtB64;
        indicesToSign = res.indicesToSign;
    }
    catch (e) {
        // select inscription UTXO
        var _b = (0, selectcoin_1.selectInscriptionUTXO)(utxos, inscriptions, sellInscriptionID), inscriptionUTXO = _b.inscriptionUTXO, inscriptionInfo = _b.inscriptionInfo;
        // create dummy UTXO from inscription UTXO
        var _c = createRawTxSplitFundFromOrdinalUTXO({
            pubKey: pubKey,
            inscriptionUTXO: inscriptionUTXO,
            inscriptionInfo: inscriptionInfo,
            sendAmount: new bignumber_js_1["default"](constants_1.DummyUTXOValue),
            feeRatePerByte: feeRatePerByte
        }), resRawTx = _c.resRawTx, newValueInscription = _c.newValueInscription;
        selectedUTXOs = resRawTx.selectedUTXOs;
        splitPsbtB64 = resRawTx.base64Psbt;
        indicesToSign = resRawTx.indicesToSign;
        newValueInscriptionRes = newValueInscription;
        // TODO: 0xkraken
        // newInscriptionUTXO = {
        //     tx_hash: txID,
        //     tx_output_n: 0,
        //     value: newValueInscription,
        // };
        // dummyUTXORes = {
        //     tx_hash: txID,
        //     tx_output_n: 1,
        //     value: new BigNumber(DummyUTXOValue),
        // };
    }
    return {
        dummyUTXO: dummyUTXORes,
        splitPsbtB64: splitPsbtB64,
        indicesToSign: indicesToSign,
        selectedUTXOs: selectedUTXOs,
        newValueInscription: newValueInscriptionRes
    };
};
exports.createRawTxDummyUTXOForSale = createRawTxDummyUTXOForSale;
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
var createTx = function (senderPrivateKey, utxos, inscriptions, sendInscriptionID, receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam) {
    if (sendInscriptionID === void 0) { sendInscriptionID = ""; }
    if (isUseInscriptionPayFeeParam === void 0) { isUseInscriptionPayFeeParam = true; }
    // init key pair and tweakedSigner from senderPrivateKey
    var keyPair = (0, wallet_1.generateTaprootKeyPair)(senderPrivateKey).keyPair;
    var _a = createRawTx({
        pubKey: (0, wallet_1.toXOnly)(keyPair.publicKey),
        utxos: utxos,
        inscriptions: inscriptions,
        sendInscriptionID: sendInscriptionID,
        receiverInsAddress: receiverInsAddress,
        sendAmount: sendAmount,
        feeRatePerByte: feeRatePerByte,
        isUseInscriptionPayFeeParam: isUseInscriptionPayFeeParam
    }), base64Psbt = _a.base64Psbt, fee = _a.fee, changeAmount = _a.changeAmount, selectedUTXOs = _a.selectedUTXOs, indicesToSign = _a.indicesToSign;
    var _b = signPSBT({
        senderPrivateKey: senderPrivateKey,
        psbtB64: base64Psbt,
        indicesToSign: indicesToSign,
        sigHashType: bitcoinjs_lib_1.Transaction.SIGHASH_DEFAULT
    }), signedBase64PSBT = _b.signedBase64PSBT, msgTx = _b.msgTx, msgTxID = _b.msgTxID, msgTxHex = _b.msgTxHex;
    return { txID: msgTxID, txHex: msgTxHex, fee: fee, selectedUTXOs: selectedUTXOs, changeAmount: changeAmount, tx: msgTx };
};
exports.createTx = createTx;
/**
* createRawTx creates the raw Bitcoin transaction (including sending inscriptions), but don't sign tx.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param pubKey buffer public key of the sender (It is the internal pubkey for Taproot address)
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
var createRawTx = function (_a) {
    var pubKey = _a.pubKey, utxos = _a.utxos, inscriptions = _a.inscriptions, _b = _a.sendInscriptionID, sendInscriptionID = _b === void 0 ? "" : _b, receiverInsAddress = _a.receiverInsAddress, sendAmount = _a.sendAmount, feeRatePerByte = _a.feeRatePerByte, _c = _a.isUseInscriptionPayFeeParam, isUseInscriptionPayFeeParam = _c === void 0 ? true : _c;
    // validation
    if (sendAmount.gt(constants_1.BNZero) && sendAmount.lt(constants_1.MinSats)) {
        throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + (0, utils_1.fromSat)(constants_1.MinSats) + " BTC.");
    }
    // select UTXOs
    var _d = (0, selectcoin_1.selectUTXOs)(utxos, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam), selectedUTXOs = _d.selectedUTXOs, valueOutInscription = _d.valueOutInscription, changeAmount = _d.changeAmount, fee = _d.fee;
    var feeRes = fee;
    // init key pair and tweakedSigner from senderPrivateKey
    // const { keyPair, senderAddress, tweakedSigner, p2pktr } = generateTaprootKeyPair(senderPrivateKey);
    var _e = (0, wallet_1.generateTaprootAddressFromPubKey)(pubKey), senderAddress = _e.address, p2pktr = _e.p2pktr;
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    // add inputs
    for (var _i = 0, selectedUTXOs_1 = selectedUTXOs; _i < selectedUTXOs_1.length; _i++) {
        var input = selectedUTXOs_1[_i];
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output },
            tapInternalKey: pubKey
        });
    }
    // add outputs
    if (sendInscriptionID !== "") {
        // add output inscription
        psbt.addOutput({
            address: receiverInsAddress,
            value: valueOutInscription.toNumber()
        });
    }
    // add output send BTC
    if (sendAmount.gt(constants_1.BNZero)) {
        psbt.addOutput({
            address: receiverInsAddress,
            value: sendAmount.toNumber()
        });
    }
    // add change output
    if (changeAmount.gt(constants_1.BNZero)) {
        if (changeAmount.gte(constants_1.MinSats)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmount.toNumber()
            });
        }
        else {
            feeRes = feeRes.plus(changeAmount);
        }
    }
    var indicesToSign = [];
    for (var i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }
    return { base64Psbt: psbt.toBase64(), fee: feeRes, changeAmount: changeAmount, selectedUTXOs: selectedUTXOs, indicesToSign: indicesToSign };
};
exports.createRawTx = createRawTx;
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
var createTxSendBTC = function (_a) {
    var senderPrivateKey = _a.senderPrivateKey, utxos = _a.utxos, inscriptions = _a.inscriptions, paymentInfos = _a.paymentInfos, feeRatePerByte = _a.feeRatePerByte;
    // validation
    var totalPaymentAmount = constants_1.BNZero;
    for (var _i = 0, paymentInfos_1 = paymentInfos; _i < paymentInfos_1.length; _i++) {
        var info = paymentInfos_1[_i];
        if (info.amount.gt(constants_1.BNZero) && info.amount.lt(constants_1.MinSats)) {
            throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + (0, utils_1.fromSat)(constants_1.MinSats) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }
    // select UTXOs
    var _b = (0, selectcoin_1.selectUTXOs)(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false), selectedUTXOs = _b.selectedUTXOs, changeAmount = _b.changeAmount, fee = _b.fee;
    var feeRes = fee;
    // init key pair and tweakedSigner from senderPrivateKey
    var _c = (0, wallet_1.generateTaprootKeyPair)(senderPrivateKey), keyPair = _c.keyPair, senderAddress = _c.senderAddress, tweakedSigner = _c.tweakedSigner, p2pktr = _c.p2pktr;
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    // add inputs
    for (var _d = 0, selectedUTXOs_2 = selectedUTXOs; _d < selectedUTXOs_2.length; _d++) {
        var input = selectedUTXOs_2[_d];
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output },
            tapInternalKey: (0, wallet_1.toXOnly)(keyPair.publicKey)
        });
    }
    // add outputs send BTC
    for (var _e = 0, paymentInfos_2 = paymentInfos; _e < paymentInfos_2.length; _e++) {
        var info = paymentInfos_2[_e];
        psbt.addOutput({
            address: info.address,
            value: info.amount.toNumber()
        });
    }
    // add change output
    if (changeAmount.gt(constants_1.BNZero)) {
        if (changeAmount.gte(constants_1.MinSats)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmount.toNumber()
            });
        }
        else {
            feeRes = feeRes.plus(changeAmount);
        }
    }
    // sign tx
    for (var i = 0; i < selectedUTXOs.length; i++) {
        psbt.signInput(i, tweakedSigner);
    }
    psbt.finalizeAllInputs();
    // get tx hex
    var tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    var txHex = tx.toHex();
    return { txID: tx.getId(), txHex: txHex, fee: feeRes, selectedUTXOs: selectedUTXOs, changeAmount: changeAmount, tx: tx };
};
exports.createTxSendBTC = createTxSendBTC;
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
var createRawTxSendBTC = function (_a) {
    var pubKey = _a.pubKey, utxos = _a.utxos, inscriptions = _a.inscriptions, paymentInfos = _a.paymentInfos, feeRatePerByte = _a.feeRatePerByte;
    // validation
    var totalPaymentAmount = constants_1.BNZero;
    for (var _i = 0, paymentInfos_3 = paymentInfos; _i < paymentInfos_3.length; _i++) {
        var info = paymentInfos_3[_i];
        if (info.amount.gt(constants_1.BNZero) && info.amount.lt(constants_1.MinSats)) {
            throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + (0, utils_1.fromSat)(constants_1.MinSats) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }
    // select UTXOs
    var _b = (0, selectcoin_1.selectUTXOs)(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false), selectedUTXOs = _b.selectedUTXOs, changeAmount = _b.changeAmount, fee = _b.fee;
    var feeRes = fee;
    var changeAmountRes = changeAmount;
    // init key pair and tweakedSigner from senderPrivateKey
    var _c = (0, wallet_1.generateTaprootAddressFromPubKey)(pubKey), senderAddress = _c.address, p2pktr = _c.p2pktr;
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    // add inputs
    for (var _d = 0, selectedUTXOs_3 = selectedUTXOs; _d < selectedUTXOs_3.length; _d++) {
        var input = selectedUTXOs_3[_d];
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output },
            tapInternalKey: pubKey
        });
    }
    // add outputs send BTC
    for (var _e = 0, paymentInfos_4 = paymentInfos; _e < paymentInfos_4.length; _e++) {
        var info = paymentInfos_4[_e];
        psbt.addOutput({
            address: info.address,
            value: info.amount.toNumber()
        });
    }
    // add change output
    if (changeAmountRes.gt(constants_1.BNZero)) {
        if (changeAmountRes.gte(constants_1.MinSats)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmountRes.toNumber()
            });
        }
        else {
            feeRes = feeRes.plus(changeAmountRes);
            changeAmountRes = constants_1.BNZero;
        }
    }
    var indicesToSign = [];
    for (var i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }
    return { base64Psbt: psbt.toBase64(), fee: feeRes, changeAmount: changeAmountRes, selectedUTXOs: selectedUTXOs, indicesToSign: indicesToSign };
};
exports.createRawTxSendBTC = createRawTxSendBTC;
/**
* createTxWithSpecificUTXOs creates the Bitcoin transaction with specific UTXOs (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* This function is used for testing.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount amount need to send (in sat)
* @param valueOutInscription inscription output's value (in sat)
* @param changeAmount cardinal change amount (in sat)
* @param fee transaction fee (in sat)
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
var createTxWithSpecificUTXOs = function (senderPrivateKey, utxos, sendInscriptionID, receiverInsAddress, sendAmount, valueOutInscription, changeAmount, fee) {
    if (sendInscriptionID === void 0) { sendInscriptionID = ""; }
    var selectedUTXOs = utxos;
    // init key pair from senderPrivateKey
    var keypair = wallet_1.ECPair.fromPrivateKey(senderPrivateKey, { network: network_1.Network });
    // Tweak the original keypair
    var tweakedSigner = (0, wallet_1.tweakSigner)(keypair, { network: network_1.Network });
    // Generate an address from the tweaked public key
    var p2pktr = bitcoinjs_lib_1.payments.p2tr({
        pubkey: (0, wallet_1.toXOnly)(tweakedSigner.publicKey),
        network: network_1.Network
    });
    var senderAddress = p2pktr.address ? p2pktr.address : "";
    if (senderAddress === "") {
        throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "Can not get the sender address from the private key");
    }
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    // add inputs
    for (var _i = 0, selectedUTXOs_4 = selectedUTXOs; _i < selectedUTXOs_4.length; _i++) {
        var input = selectedUTXOs_4[_i];
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output },
            tapInternalKey: (0, wallet_1.toXOnly)(keypair.publicKey)
        });
    }
    // add outputs
    if (sendInscriptionID !== "") {
        // add output inscription
        psbt.addOutput({
            address: receiverInsAddress,
            value: valueOutInscription.toNumber()
        });
    }
    // add output send BTC
    if (sendAmount.gt(constants_1.BNZero)) {
        psbt.addOutput({
            address: receiverInsAddress,
            value: sendAmount.toNumber()
        });
    }
    // add change output
    if (changeAmount.gt(constants_1.BNZero)) {
        psbt.addOutput({
            address: senderAddress,
            value: changeAmount.toNumber()
        });
    }
    // sign tx
    for (var i = 0; i < selectedUTXOs.length; i++) {
        psbt.signInput(i, tweakedSigner);
    }
    psbt.finalizeAllInputs();
    // get tx hex
    var tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    var txHex = tx.toHex();
    return { txID: tx.getId(), txHex: txHex, fee: fee };
};
exports.createTxWithSpecificUTXOs = createTxWithSpecificUTXOs;
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
var createTxSplitFundFromOrdinalUTXO = function (senderPrivateKey, inscriptionUTXO, inscriptionInfo, sendAmount, feeRatePerByte) {
    var keyPair = (0, wallet_1.generateTaprootKeyPair)(senderPrivateKey).keyPair;
    var _a = createRawTxSplitFundFromOrdinalUTXO({
        pubKey: (0, wallet_1.toXOnly)(keyPair.publicKey),
        inscriptionUTXO: inscriptionUTXO,
        inscriptionInfo: inscriptionInfo,
        sendAmount: sendAmount,
        feeRatePerByte: feeRatePerByte
    }), resRawTx = _a.resRawTx, newValueInscription = _a.newValueInscription;
    // sign tx
    var _b = signPSBT({
        senderPrivateKey: senderPrivateKey,
        psbtB64: resRawTx.base64Psbt,
        indicesToSign: resRawTx.indicesToSign,
        sigHashType: bitcoinjs_lib_1.Transaction.SIGHASH_DEFAULT
    }), signedBase64PSBT = _b.signedBase64PSBT, msgTx = _b.msgTx, msgTxID = _b.msgTxID, msgTxHex = _b.msgTxHex;
    return { txID: msgTxID, txHex: msgTxHex, fee: resRawTx.fee, selectedUTXOs: resRawTx.selectedUTXOs, newValueInscription: newValueInscription };
};
exports.createTxSplitFundFromOrdinalUTXO = createTxSplitFundFromOrdinalUTXO;
/**
* createRawTxSplitFundFromOrdinalUTXO creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
var createRawTxSplitFundFromOrdinalUTXO = function (_a) {
    var pubKey = _a.pubKey, inscriptionUTXO = _a.inscriptionUTXO, inscriptionInfo = _a.inscriptionInfo, sendAmount = _a.sendAmount, feeRatePerByte = _a.feeRatePerByte;
    // validation
    if (sendAmount.gt(constants_1.BNZero) && sendAmount.lt(constants_1.MinSats)) {
        throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + (0, utils_1.fromSat)(constants_1.MinSats) + " BTC.");
    }
    var _b = (0, wallet_1.generateTaprootAddressFromPubKey)(pubKey), senderAddress = _b.address, p2pktr = _b.p2pktr;
    var maxAmountInsSpend = inscriptionUTXO.value.minus(inscriptionInfo.offset).minus(1).minus(constants_1.MinSats);
    var fee = new bignumber_js_1["default"]((0, utils_1.estimateTxFee)(1, 2, feeRatePerByte));
    var totalAmountSpend = sendAmount.plus(fee);
    if (totalAmountSpend.gt(maxAmountInsSpend)) {
        throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_PAY_FEE);
    }
    var newValueInscription = inscriptionUTXO.value.minus(totalAmountSpend);
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    // add inputs
    psbt.addInput({
        hash: inscriptionUTXO.tx_hash,
        index: inscriptionUTXO.tx_output_n,
        witnessUtxo: { value: inscriptionUTXO.value.toNumber(), script: p2pktr.output },
        tapInternalKey: pubKey
    });
    // add outputs
    // add output inscription: must be at index 0
    psbt.addOutput({
        address: senderAddress,
        value: newValueInscription.toNumber()
    });
    // add output send BTC
    psbt.addOutput({
        address: senderAddress,
        value: sendAmount.toNumber()
    });
    var indicesToSign = [];
    for (var i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }
    return {
        resRawTx: { base64Psbt: psbt.toBase64(), fee: fee, changeAmount: constants_1.BNZero, selectedUTXOs: [inscriptionUTXO], indicesToSign: indicesToSign },
        newValueInscription: newValueInscription
    };
};
exports.createRawTxSplitFundFromOrdinalUTXO = createRawTxSplitFundFromOrdinalUTXO;
var selectDummyUTXO = function (utxos, inscriptions) {
    var smallestUTXO = (0, selectcoin_1.selectTheSmallestUTXO)(utxos, inscriptions);
    if (smallestUTXO.value.lte(constants_1.DummyUTXOValue)) {
        return smallestUTXO;
    }
    throw new error_1["default"](error_1.ERROR_CODE.NOT_FOUND_DUMMY_UTXO);
};
var createDummyUTXOFromCardinal = function (senderPrivateKey, utxos, inscriptions, feeRatePerByte) {
    // create dummy UTXO from cardinal UTXOs
    var dummyUTXO;
    var newUTXO = null;
    var smallestUTXO = (0, selectcoin_1.selectTheSmallestUTXO)(utxos, inscriptions);
    if (smallestUTXO.value.lte(constants_1.DummyUTXOValue)) {
        dummyUTXO = smallestUTXO;
        return { dummyUTXO: dummyUTXO, splitTxID: "", selectedUTXOs: [], newUTXO: newUTXO, fee: constants_1.BNZero, txHex: "" };
    }
    else {
        var senderAddress = (0, wallet_1.generateTaprootKeyPair)(senderPrivateKey).senderAddress;
        var _a = createTx(senderPrivateKey, utxos, inscriptions, "", senderAddress, new bignumber_js_1["default"](constants_1.DummyUTXOValue), feeRatePerByte, false), txID = _a.txID, txHex = _a.txHex, fee = _a.fee, selectedUTXOs = _a.selectedUTXOs, changeAmount = _a.changeAmount;
        // init dummy UTXO rely on the result of the split tx
        dummyUTXO = {
            tx_hash: txID,
            tx_output_n: 0,
            value: new bignumber_js_1["default"](constants_1.DummyUTXOValue)
        };
        if (changeAmount.gt(constants_1.BNZero)) {
            newUTXO = {
                tx_hash: txID,
                tx_output_n: 1,
                value: changeAmount
            };
        }
        return { dummyUTXO: dummyUTXO, splitTxID: txID, selectedUTXOs: selectedUTXOs, newUTXO: newUTXO, fee: fee, txHex: txHex };
    }
};
exports.createDummyUTXOFromCardinal = createDummyUTXOFromCardinal;
var createRawTxDummyUTXOFromCardinal = function (pubKey, utxos, inscriptions, feeRatePerByte) {
    // create dummy UTXO from cardinal UTXOs
    var dummyUTXO;
    var smallestUTXO = (0, selectcoin_1.selectTheSmallestUTXO)(utxos, inscriptions);
    if (smallestUTXO.value.lte(constants_1.DummyUTXOValue)) {
        dummyUTXO = smallestUTXO;
        return { dummyUTXO: dummyUTXO, splitPsbtB64: "", indicesToSign: [], changeAmount: constants_1.BNZero, selectedUTXOs: [], fee: constants_1.BNZero };
    }
    else {
        var senderAddress = (0, wallet_1.generateTaprootAddressFromPubKey)(pubKey).address;
        var _a = createRawTx({
            pubKey: pubKey,
            utxos: utxos,
            inscriptions: inscriptions,
            sendInscriptionID: "",
            receiverInsAddress: senderAddress,
            sendAmount: new bignumber_js_1["default"](constants_1.DummyUTXOValue),
            feeRatePerByte: feeRatePerByte,
            isUseInscriptionPayFeeParam: false
        }), base64Psbt = _a.base64Psbt, fee = _a.fee, changeAmount = _a.changeAmount, selectedUTXOs = _a.selectedUTXOs, indicesToSign = _a.indicesToSign;
        // TODO: 0x2525
        // init dummy UTXO rely on the result of the split tx
        // dummyUTXO = {
        //     tx_hash: txID,
        //     tx_output_n: 0,
        //     value: new BigNumber(DummyUTXOValue),
        // };
        // if (changeAmount.gt(BNZero)) {
        //     newUTXO = {
        //         tx_hash: txID,
        //         tx_output_n: 1,
        //         value: changeAmount,
        //     };
        // }
        return { dummyUTXO: dummyUTXO, splitPsbtB64: base64Psbt, indicesToSign: indicesToSign, selectedUTXOs: selectedUTXOs, fee: fee, changeAmount: changeAmount };
    }
};
exports.createRawTxDummyUTXOFromCardinal = createRawTxDummyUTXOFromCardinal;
var prepareUTXOsToBuyMultiInscriptions = function (_a) {
    var privateKey = _a.privateKey, address = _a.address, utxos = _a.utxos, inscriptions = _a.inscriptions, feeRatePerByte = _a.feeRatePerByte, buyReqFullInfos = _a.buyReqFullInfos;
    var splitTxID = "";
    var splitTxHex = "";
    var newUTXO;
    var dummyUTXO;
    var selectedUTXOs = [];
    var fee = constants_1.BNZero;
    // filter to get cardinal utxos
    var _b = (0, selectcoin_1.filterAndSortCardinalUTXOs)(utxos, inscriptions), cardinalUTXOs = _b.cardinalUTXOs, totalCardinalAmount = _b.totalCardinalAmount;
    // select dummy utxo
    var needCreateDummyUTXO = false;
    try {
        dummyUTXO = selectDummyUTXO(cardinalUTXOs, {});
    }
    catch (e) {
        console.log("Can not find dummy UTXO, need to create it.");
        needCreateDummyUTXO = true;
    }
    var needPaymentUTXOs = [];
    for (var i = 0; i < buyReqFullInfos.length; i++) {
        var info = buyReqFullInfos[i];
        try {
            var utxo = (0, selectcoin_1.findExactValueUTXO)(cardinalUTXOs, info.price).utxo;
            buyReqFullInfos[i].paymentUTXO = utxo;
        }
        catch (e) {
            needPaymentUTXOs.push({ buyInfoIndex: i, amount: info.price });
        }
    }
    console.log("buyReqFullInfos: ", buyReqFullInfos);
    // create split tx to create enough payment uxtos (if needed)
    if (needPaymentUTXOs.length > 0 || needCreateDummyUTXO) {
        var paymentInfos = [];
        for (var _i = 0, needPaymentUTXOs_1 = needPaymentUTXOs; _i < needPaymentUTXOs_1.length; _i++) {
            var info = needPaymentUTXOs_1[_i];
            paymentInfos.push({ address: address, amount: info.amount });
        }
        if (needCreateDummyUTXO) {
            paymentInfos.push({ address: address, amount: new bignumber_js_1["default"](constants_1.DummyUTXOValue) });
        }
        var res = createTxSendBTC({ senderPrivateKey: privateKey, utxos: cardinalUTXOs, inscriptions: {}, paymentInfos: paymentInfos, feeRatePerByte: feeRatePerByte });
        splitTxID = res.txID;
        splitTxHex = res.txHex;
        selectedUTXOs = res.selectedUTXOs;
        fee = res.fee;
        for (var i = 0; i < needPaymentUTXOs.length; i++) {
            var info = needPaymentUTXOs[i];
            var buyInfoIndex = info.buyInfoIndex;
            if (buyReqFullInfos[buyInfoIndex].paymentUTXO != null) {
                throw new error_1["default"](error_1.ERROR_CODE.INVALID_CODE);
            }
            var newUTXO_1 = {
                tx_hash: splitTxID,
                tx_output_n: i,
                value: info.amount
            };
            buyReqFullInfos[buyInfoIndex].paymentUTXO = newUTXO_1;
        }
        if (needCreateDummyUTXO) {
            dummyUTXO = {
                tx_hash: splitTxID,
                tx_output_n: needPaymentUTXOs.length,
                value: new bignumber_js_1["default"](constants_1.DummyUTXOValue)
            };
        }
        if (res.changeAmount.gt(constants_1.BNZero)) {
            var indexChangeUTXO = needCreateDummyUTXO ? needPaymentUTXOs.length + 1 : needPaymentUTXOs.length;
            newUTXO = {
                tx_hash: splitTxID,
                tx_output_n: indexChangeUTXO,
                value: res.changeAmount
            };
        }
    }
    return { buyReqFullInfos: buyReqFullInfos, dummyUTXO: dummyUTXO, splitTxID: splitTxID, selectedUTXOs: selectedUTXOs, newUTXO: newUTXO, fee: fee, splitTxHex: splitTxHex };
};
exports.prepareUTXOsToBuyMultiInscriptions = prepareUTXOsToBuyMultiInscriptions;
var createRawTxToPrepareUTXOsToBuyMultiInscs = function (_a) {
    var pubKey = _a.pubKey, address = _a.address, utxos = _a.utxos, inscriptions = _a.inscriptions, feeRatePerByte = _a.feeRatePerByte, buyReqFullInfos = _a.buyReqFullInfos;
    var splitPsbtB64 = "";
    var dummyUTXO;
    var selectedUTXOs = [];
    var fee = constants_1.BNZero;
    var changeAmount = constants_1.BNZero;
    var indicesToSign = [];
    // filter to get cardinal utxos
    var cardinalUTXOs = (0, selectcoin_1.filterAndSortCardinalUTXOs)(utxos, inscriptions).cardinalUTXOs;
    // select dummy utxo
    var needCreateDummyUTXO = false;
    try {
        dummyUTXO = selectDummyUTXO(cardinalUTXOs, {});
    }
    catch (e) {
        console.log("Can not find dummy UTXO, need to create it.");
        needCreateDummyUTXO = true;
    }
    // find payment utxos for each buy info
    var needPaymentUTXOs = [];
    for (var i = 0; i < buyReqFullInfos.length; i++) {
        var info = buyReqFullInfos[i];
        try {
            var utxo = (0, selectcoin_1.findExactValueUTXO)(cardinalUTXOs, info.price).utxo;
            buyReqFullInfos[i].paymentUTXO = utxo;
        }
        catch (e) {
            needPaymentUTXOs.push({ buyInfoIndex: i, amount: info.price });
        }
    }
    console.log("buyReqFullInfos: ", buyReqFullInfos);
    // create split tx to create enough payment uxtos (if needed)
    if (needPaymentUTXOs.length > 0 || needCreateDummyUTXO) {
        var paymentInfos = [];
        for (var _i = 0, needPaymentUTXOs_2 = needPaymentUTXOs; _i < needPaymentUTXOs_2.length; _i++) {
            var info = needPaymentUTXOs_2[_i];
            paymentInfos.push({ address: address, amount: info.amount });
        }
        if (needCreateDummyUTXO) {
            paymentInfos.push({ address: address, amount: new bignumber_js_1["default"](constants_1.DummyUTXOValue) });
        }
        var res = createRawTxSendBTC({ pubKey: pubKey, utxos: cardinalUTXOs, inscriptions: {}, paymentInfos: paymentInfos, feeRatePerByte: feeRatePerByte });
        selectedUTXOs = res.selectedUTXOs;
        fee = res.fee;
        splitPsbtB64 = res.base64Psbt;
        changeAmount = res.changeAmount;
        indicesToSign = res.indicesToSign;
    }
    return { buyReqFullInfos: buyReqFullInfos, dummyUTXO: dummyUTXO, needPaymentUTXOs: needPaymentUTXOs, splitPsbtB64: splitPsbtB64, selectedUTXOs: selectedUTXOs, fee: fee, changeAmount: changeAmount, needCreateDummyUTXO: needCreateDummyUTXO, indicesToSign: indicesToSign };
};
exports.createRawTxToPrepareUTXOsToBuyMultiInscs = createRawTxToPrepareUTXOsToBuyMultiInscs;
var broadcastTx = function (txHex) { return __awaiter(void 0, void 0, void 0, function () {
    var blockstream, response, status, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockstream = new axios_1["default"].Axios({
                    baseURL: constants_1.BlockStreamURL
                });
                return [4 /*yield*/, blockstream.post("/tx", txHex)];
            case 1:
                response = _a.sent();
                status = response.status, data = response.data;
                if (status !== 200) {
                    throw new error_1["default"](error_1.ERROR_CODE.ERR_BROADCAST_TX, data);
                }
                return [2 /*return*/, response.data];
        }
    });
}); };
exports.broadcastTx = broadcastTx;
