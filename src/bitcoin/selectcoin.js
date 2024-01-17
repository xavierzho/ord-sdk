"use strict";
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
exports.filterAndSortCardinalUTXOs = exports.findExactValueUTXO = exports.selectUTXOsToCreateBuyTx = exports.selectTheSmallestUTXO = exports.selectCardinalUTXOs = exports.selectInscriptionUTXO = exports.selectUTXOs = void 0;
var constants_1 = require("./constants");
var error_1 = require("../constants/error");
var bignumber_js_1 = require("bignumber.js");
var utils_1 = require("./utils");
/**
* selectUTXOs selects the most reasonable UTXOs to create the transaction.
* if sending inscription, the first selected UTXO is always the UTXO contain inscription.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
var selectUTXOs = function (utxos, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFee) {
    var resultUTXOs = [];
    var normalUTXOs = [];
    var inscriptionUTXO = null;
    var inscriptionInfo = null;
    var valueOutInscription = constants_1.BNZero;
    var changeAmount = constants_1.BNZero;
    var maxAmountInsTransfer = constants_1.BNZero;
    // convert feeRate to interger
    feeRatePerByte = Math.round(feeRatePerByte);
    // estimate fee
    var _a = (0, utils_1.estimateNumInOutputs)(sendInscriptionID, sendAmount, isUseInscriptionPayFee), numIns = _a.numIns, numOuts = _a.numOuts;
    var estFee = new bignumber_js_1["default"]((0, utils_1.estimateTxFee)(numIns, numOuts, feeRatePerByte));
    // when BTC amount need to send is greater than 0, 
    // we should use normal BTC to pay fee
    if (isUseInscriptionPayFee && sendAmount.gt(constants_1.BNZero)) {
        isUseInscriptionPayFee = false;
    }
    // filter normal UTXO and inscription UTXO to send
    var _b = filterAndSortCardinalUTXOs(utxos, inscriptions), cardinalUTXOs = _b.cardinalUTXOs, inscriptionUTXOs = _b.inscriptionUTXOs;
    normalUTXOs = cardinalUTXOs;
    if (sendInscriptionID !== "") {
        var res = selectInscriptionUTXO(inscriptionUTXOs, inscriptions, sendInscriptionID);
        inscriptionUTXO = res.inscriptionUTXO;
        inscriptionInfo = res.inscriptionInfo;
        // maxAmountInsTransfer = (inscriptionUTXO.value - inscriptionInfo.offset - 1) - MinSats;
        maxAmountInsTransfer = inscriptionUTXO.value.
            minus(inscriptionInfo.offset).
            minus(1).minus(constants_1.MinSats);
        console.log("maxAmountInsTransfer: ", maxAmountInsTransfer.toNumber());
    }
    if (sendInscriptionID !== "") {
        if (inscriptionUTXO === null || inscriptionInfo == null) {
            throw new error_1["default"](error_1.ERROR_CODE.NOT_FOUND_INSCRIPTION);
        }
        // if value is not enough to pay fee, MUST use normal UTXOs to pay fee
        if (isUseInscriptionPayFee && maxAmountInsTransfer.lt(estFee)) {
            isUseInscriptionPayFee = false;
        }
        // push inscription UTXO to create tx
        resultUTXOs.push(inscriptionUTXO);
    }
    // select normal UTXOs
    var totalSendAmount = sendAmount;
    if (!isUseInscriptionPayFee) {
        totalSendAmount = totalSendAmount.plus(estFee);
    }
    var totalInputAmount = constants_1.BNZero;
    if (totalSendAmount.gt(constants_1.BNZero)) {
        if (normalUTXOs.length === 0) {
            throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
        }
        if (normalUTXOs[normalUTXOs.length - 1].value.gte(totalSendAmount)) {
            // select the smallest utxo
            resultUTXOs.push(normalUTXOs[normalUTXOs.length - 1]);
            totalInputAmount = normalUTXOs[normalUTXOs.length - 1].value;
        }
        else if (normalUTXOs[0].value.lt(totalSendAmount)) {
            // select multiple UTXOs
            for (var i = 0; i < normalUTXOs.length; i++) {
                var utxo = normalUTXOs[i];
                resultUTXOs.push(utxo);
                totalInputAmount = totalInputAmount.plus(utxo.value);
                if (totalInputAmount.gte(totalSendAmount)) {
                    break;
                }
            }
            if (totalInputAmount.lt(totalSendAmount)) {
                throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
            }
        }
        else {
            // select the nearest UTXO
            var selectedUTXO = normalUTXOs[0];
            for (var i = 1; i < normalUTXOs.length; i++) {
                if (normalUTXOs[i].value.lt(totalSendAmount)) {
                    resultUTXOs.push(selectedUTXO);
                    totalInputAmount = selectedUTXO.value;
                    break;
                }
                selectedUTXO = normalUTXOs[i];
            }
        }
    }
    // re-estimate fee with exact number of inputs and outputs
    var reNumOuts = (0, utils_1.estimateNumInOutputs)(sendInscriptionID, sendAmount, isUseInscriptionPayFee).numOuts;
    var feeRes = new bignumber_js_1["default"]((0, utils_1.estimateTxFee)(resultUTXOs.length, reNumOuts, feeRatePerByte));
    // calculate output amount
    if (isUseInscriptionPayFee) {
        if (maxAmountInsTransfer.lt(feeRes)) {
            feeRes = maxAmountInsTransfer;
        }
        valueOutInscription = inscriptionUTXO.value.minus(feeRes);
        changeAmount = totalInputAmount.minus(sendAmount);
    }
    else {
        if (totalInputAmount.lt(sendAmount.plus(feeRes))) {
            feeRes = totalInputAmount.minus(sendAmount);
        }
        valueOutInscription = (inscriptionUTXO === null || inscriptionUTXO === void 0 ? void 0 : inscriptionUTXO.value) || constants_1.BNZero;
        changeAmount = totalInputAmount.minus(sendAmount).minus(feeRes);
    }
    return { selectedUTXOs: resultUTXOs, isUseInscriptionPayFee: isUseInscriptionPayFee, valueOutInscription: valueOutInscription, changeAmount: changeAmount, fee: feeRes };
};
exports.selectUTXOs = selectUTXOs;
/**
* selectUTXOs selects the most reasonable UTXOs to create the transaction.
* if sending inscription, the first selected UTXO is always the UTXO contain inscription.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @returns the ordinal UTXO
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
var selectInscriptionUTXO = function (utxos, inscriptions, inscriptionID) {
    if (inscriptionID === "") {
        throw new error_1["default"](error_1.ERROR_CODE.INVALID_PARAMS, "InscriptionID must not be an empty string");
    }
    // filter normal UTXO and inscription UTXO to send
    for (var _i = 0, utxos_1 = utxos; _i < utxos_1.length; _i++) {
        var utxo = utxos_1[_i];
        // txIDKey = tx_hash:tx_output_n
        var txIDKey = utxo.tx_hash.concat(":");
        txIDKey = txIDKey.concat(utxo.tx_output_n.toString());
        // try to get inscriptionInfos
        var inscriptionInfos = inscriptions[txIDKey];
        if (inscriptionInfos !== undefined && inscriptionInfos !== null && inscriptionInfos.length > 0) {
            var inscription = inscriptionInfos.find(function (ins) { return ins.id === inscriptionID; });
            if (inscription !== undefined) {
                // don't support send tx with outcoin that includes more than one inscription
                if (inscriptionInfos.length > 1) {
                    throw new error_1["default"](error_1.ERROR_CODE.NOT_SUPPORT_SEND);
                }
                return { inscriptionUTXO: utxo, inscriptionInfo: inscription };
            }
        }
    }
    throw new error_1["default"](error_1.ERROR_CODE.NOT_FOUND_INSCRIPTION);
};
exports.selectInscriptionUTXO = selectInscriptionUTXO;
/**
* selectCardinalUTXOs selects the most reasonable UTXOs to create the transaction.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendAmount satoshi amount need to send
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
var selectCardinalUTXOs = function (utxos, inscriptions, sendAmount) {
    var resultUTXOs = [];
    var remainUTXOs = [];
    // filter normal UTXO and inscription UTXO to send
    var normalUTXOs = filterAndSortCardinalUTXOs(utxos, inscriptions).cardinalUTXOs;
    var totalInputAmount = constants_1.BNZero;
    var cloneUTXOs = __spreadArray([], normalUTXOs, true);
    var totalSendAmount = sendAmount;
    if (totalSendAmount.gt(constants_1.BNZero)) {
        if (normalUTXOs.length === 0) {
            throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
        }
        if (normalUTXOs[normalUTXOs.length - 1].value.gte(totalSendAmount)) {
            // select the smallest utxo
            resultUTXOs.push(normalUTXOs[normalUTXOs.length - 1]);
            totalInputAmount = normalUTXOs[normalUTXOs.length - 1].value;
            remainUTXOs = cloneUTXOs.splice(0, normalUTXOs.length - 1);
        }
        else if (normalUTXOs[0].value.lt(totalSendAmount)) {
            // select multiple UTXOs
            for (var i = 0; i < normalUTXOs.length; i++) {
                var utxo = normalUTXOs[i];
                resultUTXOs.push(utxo);
                totalInputAmount = totalInputAmount.plus(utxo.value);
                if (totalInputAmount.gte(totalSendAmount)) {
                    remainUTXOs = cloneUTXOs.splice(i + 1, normalUTXOs.length - i - 1);
                    break;
                }
            }
            if (totalInputAmount.lt(totalSendAmount)) {
                throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
            }
        }
        else {
            // select the nearest UTXO
            var selectedUTXO = normalUTXOs[0];
            var selectedIndex = 0;
            for (var i = 1; i < normalUTXOs.length; i++) {
                if (normalUTXOs[i].value.lt(totalSendAmount)) {
                    resultUTXOs.push(selectedUTXO);
                    totalInputAmount = selectedUTXO.value;
                    remainUTXOs = __spreadArray([], cloneUTXOs, true);
                    remainUTXOs.splice(selectedIndex, 1);
                    break;
                }
                selectedUTXO = normalUTXOs[i];
                selectedIndex = i;
            }
        }
    }
    return { selectedUTXOs: resultUTXOs, remainUTXOs: remainUTXOs, totalInputAmount: totalInputAmount };
};
exports.selectCardinalUTXOs = selectCardinalUTXOs;
var selectUTXOsToCreateBuyTx = function (params) {
    var sellerSignedPsbt = params.sellerSignedPsbt, price = params.price, utxos = params.utxos, inscriptions = params.inscriptions, feeRate = params.feeRate;
    // estimate network fee
    var _a = (0, utils_1.estimateNumInOutputsForBuyInscription)(3, 3, sellerSignedPsbt), numIns = _a.numIns, numOuts = _a.numOuts;
    var estTotalPaymentAmount = price.plus(new bignumber_js_1["default"]((0, utils_1.estimateTxFee)(numIns, numOuts, feeRate)));
    var _b = selectCardinalUTXOs(utxos, inscriptions, estTotalPaymentAmount), selectedUTXOs = _b.selectedUTXOs, remainUTXOs = _b.remainUTXOs, totalInputAmount = _b.totalInputAmount;
    var paymentUTXOs = selectedUTXOs;
    // re-estimate network fee
    var _c = (0, utils_1.estimateNumInOutputsForBuyInscription)(paymentUTXOs.length, 3, sellerSignedPsbt), finalNumIns = _c.numIns, finalNumOuts = _c.numOuts;
    var finalTotalPaymentAmount = price.plus(new bignumber_js_1["default"]((0, utils_1.estimateTxFee)(finalNumIns, finalNumOuts, feeRate)));
    if (finalTotalPaymentAmount > totalInputAmount) {
        // need to select extra UTXOs
        var extraUTXOs = selectCardinalUTXOs(remainUTXOs, {}, finalTotalPaymentAmount.minus(totalInputAmount)).selectedUTXOs;
        paymentUTXOs = paymentUTXOs.concat(extraUTXOs);
    }
    return { selectedUTXOs: paymentUTXOs };
};
exports.selectUTXOsToCreateBuyTx = selectUTXOsToCreateBuyTx;
/**
* selectTheSmallestUTXO selects the most reasonable UTXOs to create the transaction.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendAmount satoshi amount need to send
* @param isSelectDummyUTXO need to select dummy UTXO or not
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
var selectTheSmallestUTXO = function (utxos, inscriptions) {
    var cardinalUTXOs = filterAndSortCardinalUTXOs(utxos, inscriptions).cardinalUTXOs;
    if (cardinalUTXOs.length === 0) {
        throw new error_1["default"](error_1.ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
    }
    return cardinalUTXOs[cardinalUTXOs.length - 1];
};
exports.selectTheSmallestUTXO = selectTheSmallestUTXO;
/**
* filterAndSortCardinalUTXOs filter cardinal utxos and inscription utxos.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @returns the list of cardinal UTXOs which is sorted descending by value
* @returns the list of inscription UTXOs
* @returns total amount of cardinal UTXOs
*/
var filterAndSortCardinalUTXOs = function (utxos, inscriptions) {
    var cardinalUTXOs = [];
    var inscriptionUTXOs = [];
    var totalCardinalAmount = constants_1.BNZero;
    // filter normal UTXO and inscription UTXO to send
    for (var _i = 0, utxos_2 = utxos; _i < utxos_2.length; _i++) {
        var utxo = utxos_2[_i];
        // txIDKey = tx_hash:tx_output_n
        var txIDKey = utxo.tx_hash.concat(":");
        txIDKey = txIDKey.concat(utxo.tx_output_n.toString());
        // try to get inscriptionInfos
        var inscriptionInfos = inscriptions[txIDKey];
        if (inscriptionInfos === undefined || inscriptionInfos === null || inscriptionInfos.length == 0) {
            // normal UTXO
            cardinalUTXOs.push(utxo);
            totalCardinalAmount = totalCardinalAmount.plus(utxo.value);
        }
        else {
            inscriptionUTXOs.push(utxo);
        }
    }
    cardinalUTXOs = cardinalUTXOs.sort(function (a, b) {
        if (a.value.gt(b.value)) {
            return -1;
        }
        if (a.value.lt(b.value)) {
            return 1;
        }
        return 0;
    });
    return { cardinalUTXOs: cardinalUTXOs, inscriptionUTXOs: inscriptionUTXOs, totalCardinalAmount: totalCardinalAmount };
};
exports.filterAndSortCardinalUTXOs = filterAndSortCardinalUTXOs;
/**
* findExactValueUTXO returns the cardinal utxos with exact value.
* @param cardinalUTXOs list of utxos (only non-inscription  utxos)
* @param value value of utxo
* @returns the cardinal UTXO
*/
var findExactValueUTXO = function (cardinalUTXOs, value) {
    for (var _i = 0, cardinalUTXOs_1 = cardinalUTXOs; _i < cardinalUTXOs_1.length; _i++) {
        var utxo = cardinalUTXOs_1[_i];
        if (utxo.value.eq(value)) {
            return { utxo: utxo };
        }
    }
    throw new error_1["default"](error_1.ERROR_CODE.NOT_FOUND_UTXO, value.toString());
};
exports.findExactValueUTXO = findExactValueUTXO;
