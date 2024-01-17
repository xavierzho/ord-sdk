"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.reqBuyMultiInscriptions = exports.reqBuyInscription = exports.reqListForSaleInscription = exports.createPSBTToBuy = exports.createPSBTToSell = exports.createRawPSBTToSell = void 0;
var constants_1 = require("./constants");
var bitcoinjs_lib_1 = require("bitcoinjs-lib");
var error_1 = require("../constants/error");
var tx_1 = require("./tx");
var utils_1 = require("./utils");
var wallet_1 = require("./wallet");
var selectcoin_1 = require("./selectcoin");
var bignumber_js_1 = require("bignumber.js");
var network_1 = require("./network");
var secp256k1_1 = require("@bitcoinerlab/secp256k1");
var SigHashTypeForSale = bitcoinjs_lib_1.Transaction.SIGHASH_SINGLE | bitcoinjs_lib_1.Transaction.SIGHASH_ANYONECANPAY;
/**
* createPSBTToSell creates the partially signed bitcoin transaction to sale the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param sellerAddress payment address of the seller to recieve BTC from buyer
* @param ordinalInput ordinal input coin to sell
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @returns the encoded base64 partially signed transaction
*/
var createPSBTToSell = function (params) {
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    var ordinalInput = params.inscriptionUTXO, amountPayToSeller = params.amountPayToSeller, receiverBTCAddress = params.receiverBTCAddress, sellerPrivateKey = params.sellerPrivateKey, dummyUTXO = params.dummyUTXO, creatorAddress = params.creatorAddress, feePayToCreator = params.feePayToCreator;
    var _a = (0, wallet_1.generateTaprootKeyPair)(sellerPrivateKey), keyPair = _a.keyPair, tweakedSigner = _a.tweakedSigner, p2pktr = _a.p2pktr;
    // add ordinal input into the first input coins with 
    // sighashType: Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY
    psbt.addInput({
        hash: ordinalInput.tx_hash,
        index: ordinalInput.tx_output_n,
        witnessUtxo: { value: ordinalInput.value.toNumber(), script: p2pktr.output },
        tapInternalKey: (0, wallet_1.toXOnly)(keyPair.publicKey),
        sighashType: bitcoinjs_lib_1.Transaction.SIGHASH_SINGLE | bitcoinjs_lib_1.Transaction.SIGHASH_ANYONECANPAY
    });
    if (dummyUTXO !== undefined && dummyUTXO !== null && dummyUTXO.value.gt(constants_1.BNZero)) {
        psbt.addOutput({
            address: receiverBTCAddress,
            value: amountPayToSeller.plus(dummyUTXO.value).toNumber()
        });
    }
    else {
        psbt.addOutput({
            address: receiverBTCAddress,
            value: amountPayToSeller.toNumber()
        });
    }
    // the second input and output
    // add dummy UTXO and output for paying to creator
    if (feePayToCreator.gt(constants_1.BNZero) && creatorAddress !== "") {
        psbt.addInput({
            hash: dummyUTXO.tx_hash,
            index: dummyUTXO.tx_output_n,
            witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output },
            tapInternalKey: (0, wallet_1.toXOnly)(keyPair.publicKey),
            sighashType: bitcoinjs_lib_1.Transaction.SIGHASH_SINGLE | bitcoinjs_lib_1.Transaction.SIGHASH_ANYONECANPAY
        });
        psbt.addOutput({
            address: creatorAddress,
            value: feePayToCreator.toNumber()
        });
    }
    // sign tx
    for (var i = 0; i < psbt.txInputs.length; i++) {
        psbt.signInput(i, tweakedSigner, [bitcoinjs_lib_1.Transaction.SIGHASH_SINGLE | bitcoinjs_lib_1.Transaction.SIGHASH_ANYONECANPAY]);
        var isValid = true;
        try {
            isValid = psbt.validateSignaturesOfInput(i, secp256k1_1.verifySchnorr, tweakedSigner.publicKey);
        }
        catch (e) {
            isValid = false;
        }
        if (!isValid) {
            throw new error_1["default"](error_1.ERROR_CODE.INVALID_SIG);
        }
    }
    psbt.finalizeAllInputs();
    return psbt.toBase64();
};
exports.createPSBTToSell = createPSBTToSell;
/**
* createPSBTToSell creates the partially signed bitcoin transaction to sale the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param sellerAddress payment address of the seller to recieve BTC from buyer
* @param ordinalInput ordinal input coin to sell
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @returns the encoded base64 partially signed transaction
*/
var createRawPSBTToSell = function (params) {
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    var ordinalInput = params.inscriptionUTXO, amountPayToSeller = params.amountPayToSeller, receiverBTCAddress = params.receiverBTCAddress, internalPubKey = params.internalPubKey, dummyUTXO = params.dummyUTXO, creatorAddress = params.creatorAddress, feePayToCreator = params.feePayToCreator;
    var _a = (0, wallet_1.generateTaprootAddressFromPubKey)(internalPubKey), address = _a.address, p2pktr = _a.p2pktr;
    // add ordinal input into the first input coins with 
    // sighashType: Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY
    psbt.addInput({
        hash: ordinalInput.tx_hash,
        index: ordinalInput.tx_output_n,
        witnessUtxo: { value: ordinalInput.value.toNumber(), script: p2pktr.output },
        tapInternalKey: internalPubKey,
        sighashType: bitcoinjs_lib_1.Transaction.SIGHASH_SINGLE | bitcoinjs_lib_1.Transaction.SIGHASH_ANYONECANPAY
    });
    var selectedUTXOs = [ordinalInput];
    if (dummyUTXO !== undefined && dummyUTXO !== null && dummyUTXO.value.gt(constants_1.BNZero)) {
        psbt.addOutput({
            address: receiverBTCAddress,
            value: amountPayToSeller.plus(dummyUTXO.value).toNumber()
        });
    }
    else {
        psbt.addOutput({
            address: receiverBTCAddress,
            value: amountPayToSeller.toNumber()
        });
    }
    // the second input and output
    // add dummy UTXO and output for paying to creator
    if (feePayToCreator.gt(constants_1.BNZero) && creatorAddress !== "") {
        psbt.addInput({
            hash: dummyUTXO.tx_hash,
            index: dummyUTXO.tx_output_n,
            witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output },
            tapInternalKey: internalPubKey,
            sighashType: bitcoinjs_lib_1.Transaction.SIGHASH_SINGLE | bitcoinjs_lib_1.Transaction.SIGHASH_ANYONECANPAY | bitcoinjs_lib_1.Transaction.SIGHASH_DEFAULT
        });
        selectedUTXOs.push(dummyUTXO);
        psbt.addOutput({
            address: creatorAddress,
            value: feePayToCreator.toNumber()
        });
    }
    var indicesToSign = [];
    for (var i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }
    return { base64Psbt: psbt.toBase64(), selectedUTXOs: selectedUTXOs, indicesToSign: indicesToSign, fee: constants_1.BNZero, changeAmount: constants_1.BNZero };
};
exports.createRawPSBTToSell = createRawPSBTToSell;
/**
* createPSBTToBuy creates the partially signed bitcoin transaction to buy the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbt PSBT from seller
* @param buyerPrivateKey buffer private key of the buyer
* @param buyerAddress payment address of the buy to receive inscription
* @param valueInscription value in inscription
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @param paymentUtxos cardinal input coins to payment
* @param dummyUtxo cardinal dummy input coin
* @returns the encoded base64 partially signed transaction
*/
var createPSBTToBuy = function (params) {
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    var sellerSignedPsbt = params.sellerSignedPsbt, buyerPrivateKey = params.buyerPrivateKey, price = params.price, receiverInscriptionAddress = params.receiverInscriptionAddress, valueInscription = params.valueInscription, paymentUtxos = params.paymentUtxos, dummyUtxo = params.dummyUtxo, feeRate = params.feeRate;
    var totalValue = constants_1.BNZero;
    var _a = (0, wallet_1.generateTaprootKeyPair)(buyerPrivateKey), keyPair = _a.keyPair, tweakedSigner = _a.tweakedSigner, p2pktr = _a.p2pktr, buyerAddress = _a.senderAddress;
    // Add dummy utxo to the first input coin
    psbt.addInput({
        hash: dummyUtxo.tx_hash,
        index: dummyUtxo.tx_output_n,
        witnessUtxo: { value: dummyUtxo.value.toNumber(), script: p2pktr.output },
        tapInternalKey: (0, wallet_1.toXOnly)(keyPair.publicKey)
    });
    // Add inscription output
    // the frist output coin has value equal to the sum of dummy value and value inscription
    // this makes sure the first output coin is inscription outcoin 
    psbt.addOutput({
        address: receiverInscriptionAddress,
        value: dummyUtxo.value.plus(valueInscription).toNumber()
    });
    if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
        throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
    }
    for (var i = 0; i < sellerSignedPsbt.txInputs.length; i++) {
        // Add seller signed input
        psbt.addInput(__assign(__assign({}, sellerSignedPsbt.txInputs[i]), sellerSignedPsbt.data.inputs[i]));
        // Add seller output
        psbt.addOutput(__assign({}, sellerSignedPsbt.txOutputs[i]));
    }
    // Add payment utxo inputs
    for (var _i = 0, paymentUtxos_1 = paymentUtxos; _i < paymentUtxos_1.length; _i++) {
        var utxo = paymentUtxos_1[_i];
        psbt.addInput({
            hash: utxo.tx_hash,
            index: utxo.tx_output_n,
            witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output },
            tapInternalKey: (0, wallet_1.toXOnly)(keyPair.publicKey)
        });
        totalValue = totalValue.plus(utxo.value);
    }
    var fee = new bignumber_js_1["default"]((0, utils_1.estimateTxFee)(psbt.txInputs.length, psbt.txOutputs.length, feeRate));
    if (fee.plus(price).gt(totalValue)) {
        fee = totalValue.minus(price); // maximum fee can paid
        if (fee.lt(constants_1.BNZero)) {
            throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_PAY_FEE);
        }
    }
    var changeValue = totalValue.minus(price).minus(fee);
    if (changeValue.gte(constants_1.DummyUTXOValue)) {
        // Create a new dummy utxo output for the next purchase
        psbt.addOutput({
            address: buyerAddress,
            value: constants_1.DummyUTXOValue
        });
        changeValue = changeValue.minus(constants_1.DummyUTXOValue);
        var extraFee = new bignumber_js_1["default"](constants_1.OutputSize * feeRate);
        if (changeValue.gte(extraFee)) {
            changeValue = changeValue.minus(extraFee);
            fee = fee.plus(extraFee);
        }
    }
    if (changeValue.lt(constants_1.BNZero)) {
        throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
    }
    // Change utxo
    if (changeValue.gt(constants_1.BNZero)) {
        if (changeValue.gte(constants_1.MinSats)) {
            psbt.addOutput({
                address: buyerAddress,
                value: changeValue.toNumber()
            });
        }
        else {
            fee = fee.plus(changeValue);
        }
    }
    // sign tx
    for (var i = 0; i < psbt.txInputs.length; i++) {
        if (i === 0 || i > sellerSignedPsbt.txInputs.length) {
            psbt.signInput(i, tweakedSigner);
        }
    }
    for (var i = 0; i < psbt.txInputs.length; i++) {
        if (i === 0 || i > sellerSignedPsbt.txInputs.length) {
            psbt.finalizeInput(i);
            try {
                var isValid = psbt.validateSignaturesOfInput(i, secp256k1_1.verifySchnorr, tweakedSigner.publicKey);
                if (!isValid) {
                    console.log("Tx signature is invalid " + i);
                }
            }
            catch (e) {
                console.log("Tx signature is invalid " + i);
            }
        }
    }
    // get tx hex
    var tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    var txHex = tx.toHex();
    return { txID: tx.getId(), txHex: txHex, fee: fee, selectedUTXOs: __spreadArray(__spreadArray([], paymentUtxos, true), [dummyUtxo], false), changeAmount: changeValue, tx: tx };
};
exports.createPSBTToBuy = createPSBTToBuy;
/**
* createRawPSBTToBuy creates the raw partially signed bitcoin transaction to buy the inscription (not signed yet).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbt PSBT from seller
* @param internalPubKey buffer public key of the buyer
* @param receiverInscriptionAddress payment address of the buyer to receive inscription
* @param valueInscription value in inscription
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @param paymentUtxos cardinal input coins to payment
* @param dummyUtxo cardinal dummy input coin
* @returns the encoded base64 psbt
*/
var createRawPSBTToBuy = function (_a) {
    var sellerSignedPsbt = _a.sellerSignedPsbt, internalPubKey = _a.internalPubKey, receiverInscriptionAddress = _a.receiverInscriptionAddress, valueInscription = _a.valueInscription, price = _a.price, paymentUtxos = _a.paymentUtxos, dummyUtxo = _a.dummyUtxo, feeRate = _a.feeRate;
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    var totalValue = constants_1.BNZero;
    var _b = (0, wallet_1.generateTaprootAddressFromPubKey)(internalPubKey), p2pktr = _b.p2pktr, buyerAddress = _b.address;
    // Add dummy utxo to the first input coin
    psbt.addInput({
        hash: dummyUtxo.tx_hash,
        index: dummyUtxo.tx_output_n,
        witnessUtxo: { value: dummyUtxo.value.toNumber(), script: p2pktr.output },
        tapInternalKey: internalPubKey
    });
    // Add inscription output
    // the frist output coin has value equal to the sum of dummy value and value inscription
    // this makes sure the first output coin is inscription outcoin 
    psbt.addOutput({
        address: receiverInscriptionAddress,
        value: dummyUtxo.value.plus(valueInscription).toNumber()
    });
    if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
        throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
    }
    for (var i = 0; i < sellerSignedPsbt.txInputs.length; i++) {
        // Add seller signed input
        psbt.addInput(__assign(__assign({}, sellerSignedPsbt.txInputs[i]), sellerSignedPsbt.data.inputs[i]));
        // Add seller output
        psbt.addOutput(__assign({}, sellerSignedPsbt.txOutputs[i]));
    }
    // Add payment utxo inputs
    for (var _i = 0, paymentUtxos_2 = paymentUtxos; _i < paymentUtxos_2.length; _i++) {
        var utxo = paymentUtxos_2[_i];
        psbt.addInput({
            hash: utxo.tx_hash,
            index: utxo.tx_output_n,
            witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output },
            tapInternalKey: internalPubKey
        });
        totalValue = totalValue.plus(utxo.value);
    }
    var fee = new bignumber_js_1["default"]((0, utils_1.estimateTxFee)(psbt.txInputs.length, psbt.txOutputs.length, feeRate));
    if (fee.plus(price).gt(totalValue)) {
        fee = totalValue.minus(price); // maximum fee can paid
        if (fee.lt(constants_1.BNZero)) {
            throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_PAY_FEE);
        }
    }
    var changeValue = totalValue.minus(price).minus(fee);
    if (changeValue.gte(constants_1.DummyUTXOValue)) {
        // Create a new dummy utxo output for the next purchase
        psbt.addOutput({
            address: buyerAddress,
            value: constants_1.DummyUTXOValue
        });
        changeValue = changeValue.minus(constants_1.DummyUTXOValue);
        var extraFee = new bignumber_js_1["default"](constants_1.OutputSize * feeRate);
        if (changeValue.gte(extraFee)) {
            changeValue = changeValue.minus(extraFee);
            fee = fee.plus(extraFee);
        }
    }
    if (changeValue.lt(constants_1.BNZero)) {
        throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
    }
    // Change utxo
    if (changeValue.gt(constants_1.BNZero)) {
        if (changeValue.gte(constants_1.MinSats)) {
            psbt.addOutput({
                address: buyerAddress,
                value: changeValue.toNumber()
            });
        }
        else {
            fee = fee.plus(changeValue);
            changeValue = constants_1.BNZero;
        }
    }
    var indicesToSign = [];
    for (var i = 0; i < psbt.txInputs.length; i++) {
        if (i === 0 || i > sellerSignedPsbt.txInputs.length) {
            indicesToSign.push(i);
        }
    }
    return { base64Psbt: psbt.toBase64(), selectedUTXOs: __spreadArray(__spreadArray([], paymentUtxos, true), [dummyUtxo], false), indicesToSign: indicesToSign, fee: fee, changeAmount: changeValue };
};
/**
* createPSBTToBuy creates the partially signed bitcoin transaction to buy the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbt PSBT from seller
* @param buyerPrivateKey buffer private key of the buyer
* @param buyerAddress payment address of the buy to receive inscription
* @param valueInscription value in inscription
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @param paymentUtxos cardinal input coins to payment
* @param dummyUtxo cardinal dummy input coin
* @returns the encoded base64 partially signed transaction
*/
var createPSBTToBuyMultiInscriptions = function (_a) {
    var buyReqFullInfos = _a.buyReqFullInfos, buyerPrivateKey = _a.buyerPrivateKey, feeUTXOs = _a.feeUTXOs, fee = _a.fee, dummyUTXO = _a.dummyUTXO, feeRatePerByte = _a.feeRatePerByte;
    // validation
    if (buyReqFullInfos.length === 0) {
        throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "buyReqFullInfos is empty");
    }
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    var indexInputNeedToSign = [];
    var selectedUTXOs = [];
    var _b = (0, wallet_1.generateTaprootKeyPair)(buyerPrivateKey), keyPair = _b.keyPair, tweakedSigner = _b.tweakedSigner, p2pktr = _b.p2pktr, buyerAddress = _b.senderAddress;
    // Add dummy utxo to the first input coin
    psbt.addInput({
        hash: dummyUTXO.tx_hash,
        index: dummyUTXO.tx_output_n,
        witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output },
        tapInternalKey: (0, wallet_1.toXOnly)(keyPair.publicKey)
    });
    indexInputNeedToSign.push(0);
    selectedUTXOs.push(dummyUTXO);
    // Add the first inscription output
    // the frist output coin has value equal to the sum of dummy value and value inscription
    // this makes sure the first output coin is inscription outcoin 
    var theFirstBuyReq = buyReqFullInfos[0];
    psbt.addOutput({
        address: theFirstBuyReq.receiverInscriptionAddress,
        value: dummyUTXO.value.plus(theFirstBuyReq.valueInscription).toNumber()
    });
    for (var i = 0; i < buyReqFullInfos.length; i++) {
        var info = buyReqFullInfos[i];
        var sellerSignedPsbt = info.sellerSignedPsbt;
        var paymentUTXO = info.paymentUTXO;
        if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
            throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
        }
        for (var i_1 = 0; i_1 < sellerSignedPsbt.txInputs.length; i_1++) {
            // Add seller signed input
            psbt.addInput(__assign(__assign({}, sellerSignedPsbt.txInputs[i_1]), sellerSignedPsbt.data.inputs[i_1]));
            // Add seller output
            psbt.addOutput(__assign({}, sellerSignedPsbt.txOutputs[i_1]));
        }
        // add payment utxo input
        psbt.addInput({
            hash: paymentUTXO.tx_hash,
            index: paymentUTXO.tx_output_n,
            witnessUtxo: { value: paymentUTXO.value.toNumber(), script: p2pktr.output },
            tapInternalKey: (0, wallet_1.toXOnly)(keyPair.publicKey)
        });
        indexInputNeedToSign.push(psbt.txInputs.length - 1);
        selectedUTXOs.push(paymentUTXO);
        // add receiver next inscription output
        if (i < buyReqFullInfos.length - 1) {
            var theNextBuyReq = buyReqFullInfos[i + 1];
            psbt.addOutput({
                address: theNextBuyReq.receiverInscriptionAddress,
                value: theNextBuyReq.valueInscription.toNumber()
            });
        }
    }
    // add utxo for pay fee
    var totalAmountFeeUTXOs = constants_1.BNZero;
    for (var _i = 0, feeUTXOs_1 = feeUTXOs; _i < feeUTXOs_1.length; _i++) {
        var utxo = feeUTXOs_1[_i];
        psbt.addInput({
            hash: utxo.tx_hash,
            index: utxo.tx_output_n,
            witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output },
            tapInternalKey: (0, wallet_1.toXOnly)(keyPair.publicKey)
        });
        indexInputNeedToSign.push(psbt.txInputs.length - 1);
        totalAmountFeeUTXOs = totalAmountFeeUTXOs.plus(utxo.value);
    }
    selectedUTXOs.push.apply(selectedUTXOs, feeUTXOs);
    // let fee = new BigNumber(estimateTxFee(psbt.txInputs.length, psbt.txOutputs.length, feeRate));
    if (fee.gt(totalAmountFeeUTXOs)) {
        fee = totalAmountFeeUTXOs; // maximum fee can paid
    }
    var changeValue = totalAmountFeeUTXOs.minus(fee);
    if (changeValue.gte(constants_1.DummyUTXOValue)) {
        // Create a new dummy utxo output for the next purchase
        psbt.addOutput({
            address: buyerAddress,
            value: constants_1.DummyUTXOValue
        });
        changeValue = changeValue.minus(constants_1.DummyUTXOValue);
        var extraFee = new bignumber_js_1["default"](constants_1.OutputSize * feeRatePerByte);
        if (changeValue.gte(extraFee)) {
            changeValue = changeValue.minus(extraFee);
            fee = fee.plus(extraFee);
        }
    }
    if (changeValue.lt(constants_1.BNZero)) {
        throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
    }
    // Change utxo
    if (changeValue.gt(constants_1.BNZero)) {
        if (changeValue.gte(constants_1.MinSats)) {
            psbt.addOutput({
                address: buyerAddress,
                value: changeValue.toNumber()
            });
        }
        else {
            fee = fee.plus(changeValue);
            changeValue = constants_1.BNZero;
        }
    }
    console.log("indexInputNeedToSign: ", indexInputNeedToSign);
    var _loop_1 = function (i) {
        if (indexInputNeedToSign.findIndex(function (value) { return value === i; }) !== -1) {
            psbt.signInput(i, tweakedSigner);
        }
    };
    // sign tx
    for (var i = 0; i < psbt.txInputs.length; i++) {
        _loop_1(i);
    }
    var _loop_2 = function (i) {
        if (indexInputNeedToSign.findIndex(function (value) { return value === i; }) !== -1) {
            psbt.finalizeInput(i);
            try {
                var isValid = psbt.validateSignaturesOfInput(i, secp256k1_1.verifySchnorr, tweakedSigner.publicKey);
                if (!isValid) {
                    console.log("Tx signature is invalid " + i);
                }
            }
            catch (e) {
                console.log("Tx signature is invalid " + i);
            }
        }
    };
    for (var i = 0; i < psbt.txInputs.length; i++) {
        _loop_2(i);
    }
    // get tx hex
    var tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    var txHex = tx.toHex();
    return { txID: tx.getId(), txHex: txHex, fee: fee, selectedUTXOs: selectedUTXOs, changeAmount: changeValue, tx: tx };
};
/**
* createRawPSBTToBuyMultiInscriptions creates the partially signed bitcoin transaction to buy multiple inscriptions.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbt PSBT from seller
* @param internalPubKey buffer public key of the buyer
* @param buyerAddress payment address of the buy to receive inscription
* @param valueInscription value in inscription
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @param paymentUtxos cardinal input coins to payment
* @param dummyUtxo cardinal dummy input coin
* @returns the encoded base64 partially signed transaction
*/
var createRawPSBTToBuyMultiInscriptions = function (_a) {
    var buyReqFullInfos = _a.buyReqFullInfos, internalPubKey = _a.internalPubKey, feeUTXOs = _a.feeUTXOs, fee = _a.fee, dummyUTXO = _a.dummyUTXO, feeRatePerByte = _a.feeRatePerByte;
    // validation
    if (buyReqFullInfos.length === 0) {
        throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "buyReqFullInfos is empty");
    }
    var psbt = new bitcoinjs_lib_1.Psbt({ network: network_1.Network });
    var indexInputNeedToSign = [];
    var selectedUTXOs = [];
    var _b = (0, wallet_1.generateTaprootAddressFromPubKey)(internalPubKey), p2pktr = _b.p2pktr, buyerAddress = _b.address;
    // Add dummy utxo to the first input coin
    psbt.addInput({
        hash: dummyUTXO.tx_hash,
        index: dummyUTXO.tx_output_n,
        witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output },
        tapInternalKey: internalPubKey
    });
    indexInputNeedToSign.push(0);
    selectedUTXOs.push(dummyUTXO);
    // Add the first inscription output
    // the frist output coin has value equal to the sum of dummy value and value inscription
    // this makes sure the first output coin is inscription outcoin 
    var theFirstBuyReq = buyReqFullInfos[0];
    psbt.addOutput({
        address: theFirstBuyReq.receiverInscriptionAddress,
        value: dummyUTXO.value.plus(theFirstBuyReq.valueInscription).toNumber()
    });
    for (var i = 0; i < buyReqFullInfos.length; i++) {
        var info = buyReqFullInfos[i];
        var sellerSignedPsbt = info.sellerSignedPsbt;
        var paymentUTXO = info.paymentUTXO;
        if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
            throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
        }
        for (var i_2 = 0; i_2 < sellerSignedPsbt.txInputs.length; i_2++) {
            // Add seller signed input
            psbt.addInput(__assign(__assign({}, sellerSignedPsbt.txInputs[i_2]), sellerSignedPsbt.data.inputs[i_2]));
            // Add seller output
            psbt.addOutput(__assign({}, sellerSignedPsbt.txOutputs[i_2]));
        }
        // add payment utxo input
        psbt.addInput({
            hash: paymentUTXO.tx_hash,
            index: paymentUTXO.tx_output_n,
            witnessUtxo: { value: paymentUTXO.value.toNumber(), script: p2pktr.output },
            tapInternalKey: internalPubKey
        });
        indexInputNeedToSign.push(psbt.txInputs.length - 1);
        selectedUTXOs.push(paymentUTXO);
        // add receiver next inscription output
        if (i < buyReqFullInfos.length - 1) {
            var theNextBuyReq = buyReqFullInfos[i + 1];
            psbt.addOutput({
                address: theNextBuyReq.receiverInscriptionAddress,
                value: theNextBuyReq.valueInscription.toNumber()
            });
        }
    }
    // add utxo for pay fee
    var totalAmountFeeUTXOs = constants_1.BNZero;
    for (var _i = 0, feeUTXOs_2 = feeUTXOs; _i < feeUTXOs_2.length; _i++) {
        var utxo = feeUTXOs_2[_i];
        psbt.addInput({
            hash: utxo.tx_hash,
            index: utxo.tx_output_n,
            witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output },
            tapInternalKey: internalPubKey
        });
        indexInputNeedToSign.push(psbt.txInputs.length - 1);
        totalAmountFeeUTXOs = totalAmountFeeUTXOs.plus(utxo.value);
    }
    selectedUTXOs.push.apply(selectedUTXOs, feeUTXOs);
    // let fee = new BigNumber(estimateTxFee(psbt.txInputs.length, psbt.txOutputs.length, feeRate));
    if (fee.gt(totalAmountFeeUTXOs)) {
        fee = totalAmountFeeUTXOs; // maximum fee can paid
    }
    var changeValue = totalAmountFeeUTXOs.minus(fee);
    if (changeValue.gte(constants_1.DummyUTXOValue)) {
        // Create a new dummy utxo output for the next purchase
        psbt.addOutput({
            address: buyerAddress,
            value: constants_1.DummyUTXOValue
        });
        changeValue = changeValue.minus(constants_1.DummyUTXOValue);
        var extraFee = new bignumber_js_1["default"](constants_1.OutputSize * feeRatePerByte);
        if (changeValue.gte(extraFee)) {
            changeValue = changeValue.minus(extraFee);
            fee = fee.plus(extraFee);
        }
    }
    if (changeValue.lt(constants_1.BNZero)) {
        throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
    }
    // Change utxo
    if (changeValue.gt(constants_1.BNZero)) {
        if (changeValue.gte(constants_1.MinSats)) {
            psbt.addOutput({
                address: buyerAddress,
                value: changeValue.toNumber()
            });
        }
        else {
            fee = fee.plus(changeValue);
            changeValue = constants_1.BNZero;
        }
    }
    console.log("indexInputNeedToSign: ", indexInputNeedToSign);
    return { base64Psbt: psbt.toBase64(), selectedUTXOs: selectedUTXOs, indicesToSign: indexInputNeedToSign, fee: fee, changeAmount: changeValue };
};
/**
* reqListForSaleInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param amountPayToSeller BTC amount to pay to seller
* @param feePayToCreator BTC fee to pay to creator
* @param creatorAddress address of creator
* amountPayToSeller + feePayToCreator = price that is showed on UI
* @returns the base64 encode Psbt
*/
var reqListForSaleInscription = function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var sellerPrivateKey, utxos, inscriptions, sellInscriptionID, receiverBTCAddress, feeRatePerByte, amountPayToSeller, feePayToCreator, creatorAddress, needDummyUTXO, _a, inscriptionUTXO, inscriptionInfo, newInscriptionUTXO, dummyUTXORes, selectedUTXOs, splitTxID, splitTxRaw, res, e_1, _b, txID, txHex, newValueInscription, base64Psbt, inscriptionUTXOs;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                sellerPrivateKey = params.sellerPrivateKey, utxos = params.utxos, inscriptions = params.inscriptions, sellInscriptionID = params.sellInscriptionID, receiverBTCAddress = params.receiverBTCAddress, feeRatePerByte = params.feeRatePerByte;
                amountPayToSeller = params.amountPayToSeller, feePayToCreator = params.feePayToCreator, creatorAddress = params.creatorAddress;
                // validation
                if (feePayToCreator.gt(constants_1.BNZero) && creatorAddress === "") {
                    throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "Creator address must not be empty.");
                }
                if (sellInscriptionID === "") {
                    throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "SellInscriptionID must not be empty.");
                }
                if (receiverBTCAddress === "") {
                    throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "receiverBTCAddress must not be empty.");
                }
                if (amountPayToSeller.eq(constants_1.BNZero)) {
                    throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "amountPayToSeller must be greater than zero.");
                }
                needDummyUTXO = false;
                if (feePayToCreator.gt(constants_1.BNZero)) {
                    // creator is the selller
                    if (creatorAddress !== receiverBTCAddress) {
                        needDummyUTXO = true;
                    }
                    else {
                        // create only one output, don't need to create 2 outputs
                        amountPayToSeller = amountPayToSeller.plus(feePayToCreator);
                        creatorAddress = "";
                        feePayToCreator = constants_1.BNZero;
                    }
                }
                if (amountPayToSeller.lt(constants_1.MinSats)) {
                    throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "amountPayToSeller must not be less than " + (0, utils_1.fromSat)(constants_1.MinSats) + " BTC.");
                }
                if (feePayToCreator.gt(constants_1.BNZero) && feePayToCreator.lt(constants_1.MinSats)) {
                    throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "feePayToCreator must not be less than " + (0, utils_1.fromSat)(constants_1.MinSats) + " BTC.");
                }
                _a = (0, selectcoin_1.selectInscriptionUTXO)(utxos, inscriptions, sellInscriptionID), inscriptionUTXO = _a.inscriptionUTXO, inscriptionInfo = _a.inscriptionInfo;
                newInscriptionUTXO = inscriptionUTXO;
                selectedUTXOs = [];
                splitTxID = "";
                splitTxRaw = "";
                if (!needDummyUTXO) return [3 /*break*/, 4];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, tx_1.createDummyUTXOFromCardinal)(sellerPrivateKey, utxos, inscriptions, feeRatePerByte)];
            case 2:
                res = _c.sent();
                dummyUTXORes = res.dummyUTXO;
                selectedUTXOs = res.selectedUTXOs;
                splitTxID = res.splitTxID;
                splitTxRaw = res.txHex;
                return [3 /*break*/, 4];
            case 3:
                e_1 = _c.sent();
                _b = (0, tx_1.createTxSplitFundFromOrdinalUTXO)(sellerPrivateKey, inscriptionUTXO, inscriptionInfo, new bignumber_js_1["default"](constants_1.DummyUTXOValue), feeRatePerByte), txID = _b.txID, txHex = _b.txHex, newValueInscription = _b.newValueInscription;
                splitTxID = txID;
                splitTxRaw = txHex;
                newInscriptionUTXO = {
                    tx_hash: txID,
                    tx_output_n: 0,
                    value: newValueInscription
                };
                dummyUTXORes = {
                    tx_hash: txID,
                    tx_output_n: 1,
                    value: new bignumber_js_1["default"](constants_1.DummyUTXOValue)
                };
                return [3 /*break*/, 4];
            case 4:
                console.log("sell splitTxID: ", splitTxID);
                console.log("sell dummyUTXORes: ", dummyUTXORes);
                console.log("sell newInscriptionUTXO: ", newInscriptionUTXO);
                base64Psbt = createPSBTToSell({
                    inscriptionUTXO: newInscriptionUTXO,
                    amountPayToSeller: amountPayToSeller,
                    receiverBTCAddress: receiverBTCAddress,
                    sellerPrivateKey: sellerPrivateKey,
                    dummyUTXO: dummyUTXORes,
                    creatorAddress: creatorAddress,
                    feePayToCreator: feePayToCreator
                });
                inscriptionUTXOs = [inscriptionUTXO];
                if (dummyUTXORes !== null) {
                    inscriptionUTXOs.push(dummyUTXORes);
                }
                return [2 /*return*/, { base64Psbt: base64Psbt, selectedUTXOs: inscriptionUTXOs, splitTxID: splitTxID, splitUTXOs: selectedUTXOs, splitTxRaw: splitTxRaw }];
        }
    });
}); };
exports.reqListForSaleInscription = reqListForSaleInscription;
/**
* reqBuyInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbtB64 buffer private key of the buyer
* @param buyerPrivateKey buffer private key of the buyer
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param price  = amount pay to seller + fee pay to creator
* @returns the base64 encode Psbt
*/
var reqBuyInscription = function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var sellerSignedPsbtB64, buyerPrivateKey, receiverInscriptionAddress, price, utxos, inscriptions, feeRatePerByte, sellerSignedPsbt, sellerInputs, valueInscription, newUTXOs, _a, dummyUTXO, splitTxID, selectedUTXOs, newUTXO, feeSplitUTXO, splitTxRaw, _loop_3, _i, selectedUTXOs_1, selectedUtxo, index, paymentUTXOs, res;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                sellerSignedPsbtB64 = params.sellerSignedPsbtB64, buyerPrivateKey = params.buyerPrivateKey, receiverInscriptionAddress = params.receiverInscriptionAddress, price = params.price, utxos = params.utxos, inscriptions = params.inscriptions, feeRatePerByte = params.feeRatePerByte;
                sellerSignedPsbt = bitcoinjs_lib_1.Psbt.fromBase64(sellerSignedPsbtB64, { network: network_1.Network });
                sellerInputs = sellerSignedPsbt.data.inputs;
                if (sellerInputs.length === 0) {
                    throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "Invalid seller's PSBT.");
                }
                valueInscription = (_b = sellerInputs[0].witnessUtxo) === null || _b === void 0 ? void 0 : _b.value;
                if (valueInscription === undefined || valueInscription === 0) {
                    throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "Invalid value inscription in seller's PSBT.");
                }
                newUTXOs = utxos;
                return [4 /*yield*/, (0, tx_1.createDummyUTXOFromCardinal)(buyerPrivateKey, utxos, inscriptions, feeRatePerByte)];
            case 1:
                _a = _c.sent(), dummyUTXO = _a.dummyUTXO, splitTxID = _a.splitTxID, selectedUTXOs = _a.selectedUTXOs, newUTXO = _a.newUTXO, feeSplitUTXO = _a.fee, splitTxRaw = _a.txHex;
                console.log("buy dummyUTXO: ", dummyUTXO);
                console.log("buy splitTxID: ", splitTxID);
                console.log("buy selectedUTXOs for split: ", selectedUTXOs);
                console.log("buy newUTXO: ", newUTXO);
                // remove selected utxo or dummyUTXO, and append new UTXO to list of UTXO to create the next PSBT 
                if (selectedUTXOs.length > 0) {
                    _loop_3 = function (selectedUtxo) {
                        var index = newUTXOs.findIndex(function (utxo) { return utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n; });
                        newUTXOs.splice(index, 1);
                    };
                    for (_i = 0, selectedUTXOs_1 = selectedUTXOs; _i < selectedUTXOs_1.length; _i++) {
                        selectedUtxo = selectedUTXOs_1[_i];
                        _loop_3(selectedUtxo);
                    }
                }
                else {
                    index = newUTXOs.findIndex(function (utxo) { return utxo.tx_hash === dummyUTXO.tx_hash && utxo.tx_output_n === dummyUTXO.tx_output_n; });
                    newUTXOs.splice(index, 1);
                }
                if (newUTXO !== undefined && newUTXO !== null) {
                    newUTXOs.push(newUTXO);
                }
                console.log("buy newUTXOs: ", newUTXOs);
                paymentUTXOs = (0, selectcoin_1.selectUTXOsToCreateBuyTx)({ sellerSignedPsbt: sellerSignedPsbt, price: price, utxos: newUTXOs, inscriptions: inscriptions, feeRate: feeRatePerByte }).selectedUTXOs;
                console.log("selected UTXOs to buy paymentUTXOs: ", paymentUTXOs);
                res = createPSBTToBuy({
                    sellerSignedPsbt: sellerSignedPsbt,
                    buyerPrivateKey: buyerPrivateKey,
                    receiverInscriptionAddress: receiverInscriptionAddress,
                    valueInscription: new bignumber_js_1["default"](valueInscription),
                    price: price,
                    paymentUtxos: paymentUTXOs,
                    dummyUtxo: dummyUTXO,
                    feeRate: feeRatePerByte
                });
                return [2 /*return*/, {
                        tx: res.tx,
                        txID: res === null || res === void 0 ? void 0 : res.txID,
                        txHex: res === null || res === void 0 ? void 0 : res.txHex,
                        fee: res === null || res === void 0 ? void 0 : res.fee.plus(feeSplitUTXO),
                        selectedUTXOs: __spreadArray(__spreadArray([], paymentUTXOs, true), [dummyUTXO], false),
                        splitTxID: splitTxID,
                        splitUTXOs: __spreadArray([], selectedUTXOs, true),
                        splitTxRaw: splitTxRaw
                    }];
        }
    });
}); };
exports.reqBuyInscription = reqBuyInscription;
/**
* reqBuyInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbtB64 buffer private key of the buyer
* @param buyerPrivateKey buffer private key of the buyer
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param price  = amount pay to seller + fee pay to creator
* @returns the base64 encode Psbt
*/
var reqBuyMultiInscriptions = function (params) {
    var _a;
    var buyReqInfos = params.buyReqInfos, buyerPrivateKey = params.buyerPrivateKey, utxos = params.utxos, inscriptions = params.inscriptions, feeRatePerByte = params.feeRatePerByte;
    // 
    var buyerAddress = (0, wallet_1.generateTaprootKeyPair)(buyerPrivateKey).senderAddress;
    // decode list of seller's signed PSBT
    var buyReqFullInfos = [];
    for (var i = 0; i < buyReqInfos.length; i++) {
        var sellerSignedPsbtB64 = buyReqInfos[i].sellerSignedPsbtB64;
        var sellerSignedPsbt = bitcoinjs_lib_1.Psbt.fromBase64(sellerSignedPsbtB64, { network: network_1.Network });
        var sellerInputs = sellerSignedPsbt.data.inputs;
        if (sellerInputs.length === 0) {
            throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "Invalid seller's PSBT.");
        }
        var valueInscription = (_a = sellerInputs[0].witnessUtxo) === null || _a === void 0 ? void 0 : _a.value;
        if (valueInscription === undefined || valueInscription === 0) {
            throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "Invalid value inscription in seller's PSBT.");
        }
        buyReqFullInfos.push(__assign(__assign({}, buyReqInfos[i]), { sellerSignedPsbt: sellerSignedPsbt, valueInscription: new bignumber_js_1["default"](valueInscription), paymentUTXO: null }));
    }
    var newUTXOs = __spreadArray([], utxos, true);
    // need to split UTXOs correspond to list of prices to payment
    // and only one dummy UTXO for multiple inscriptions
    var _b = (0, tx_1.prepareUTXOsToBuyMultiInscriptions)({ privateKey: buyerPrivateKey, address: buyerAddress, utxos: utxos, inscriptions: inscriptions, feeRatePerByte: feeRatePerByte, buyReqFullInfos: buyReqFullInfos }), buyReqFullInfosRes = _b.buyReqFullInfos, dummyUTXO = _b.dummyUTXO, splitTxID = _b.splitTxID, selectedUTXOs = _b.selectedUTXOs, newUTXO = _b.newUTXO, feeSplitUTXO = _b.fee, splitTxHex = _b.splitTxHex;
    buyReqFullInfos = buyReqFullInfosRes;
    console.log("buyReqFullInfos: ", buyReqFullInfos);
    console.log("buyReqInfos: ", buyReqInfos);
    console.log("buy dummyUTXO: ", dummyUTXO);
    console.log("buy splitTxID: ", splitTxID);
    console.log("buy selectedUTXOs for split: ", selectedUTXOs);
    console.log("buy newUTXO: ", newUTXO);
    // remove selected utxo, payment utxo, dummyUTXO, and append new UTXO to list of UTXO to create the next PSBT
    var tmpSelectedUTXOs = __spreadArray([], selectedUTXOs, true);
    for (var _i = 0, buyReqFullInfos_1 = buyReqFullInfos; _i < buyReqFullInfos_1.length; _i++) {
        var info = buyReqFullInfos_1[_i];
        tmpSelectedUTXOs.push(info.paymentUTXO);
    }
    tmpSelectedUTXOs.push(dummyUTXO);
    var _loop_4 = function (selectedUtxo) {
        var index = newUTXOs.findIndex(function (utxo) { return utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n; });
        if (index !== -1) {
            newUTXOs.splice(index, 1);
        }
    };
    for (var _c = 0, tmpSelectedUTXOs_1 = tmpSelectedUTXOs; _c < tmpSelectedUTXOs_1.length; _c++) {
        var selectedUtxo = tmpSelectedUTXOs_1[_c];
        _loop_4(selectedUtxo);
    }
    if (newUTXO !== undefined && newUTXO !== null) {
        newUTXOs.push(newUTXO);
    }
    console.log("buy newUTXOs: ", newUTXOs);
    // estimate fee
    var numIns = 2 + buyReqFullInfos.length; // one for dummy utxo, one for network fee
    var numOuts = 1 + buyReqFullInfos.length; // one for change value
    for (var _d = 0, buyReqFullInfos_2 = buyReqFullInfos; _d < buyReqFullInfos_2.length; _d++) {
        var info = buyReqFullInfos_2[_d];
        numIns += info.sellerSignedPsbt.txInputs.length;
        numOuts += info.sellerSignedPsbt.txOutputs.length;
    }
    var fee = new bignumber_js_1["default"]((0, utils_1.estimateTxFee)(numIns, numOuts, feeRatePerByte));
    // select cardinal UTXOs to pay fee
    console.log("BUY Fee estimate: ", fee.toNumber());
    var _e = (0, selectcoin_1.selectCardinalUTXOs)(newUTXOs, inscriptions, fee), feeSelectedUTXOs = _e.selectedUTXOs, totalInputAmount = _e.totalInputAmount;
    // create PBTS from the seller's one
    var res = createPSBTToBuyMultiInscriptions({
        buyReqFullInfos: buyReqFullInfos,
        buyerPrivateKey: buyerPrivateKey,
        feeUTXOs: feeSelectedUTXOs,
        fee: fee,
        dummyUTXO: dummyUTXO,
        feeRatePerByte: feeRatePerByte
    });
    fee = res.fee;
    return {
        tx: res.tx,
        txID: res === null || res === void 0 ? void 0 : res.txID,
        txHex: res === null || res === void 0 ? void 0 : res.txHex,
        fee: res === null || res === void 0 ? void 0 : res.fee.plus(feeSplitUTXO),
        selectedUTXOs: res.selectedUTXOs,
        splitTxID: splitTxID,
        splitUTXOs: __spreadArray([], selectedUTXOs, true),
        splitTxRaw: splitTxHex
    };
};
exports.reqBuyMultiInscriptions = reqBuyMultiInscriptions;
