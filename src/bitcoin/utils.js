"use strict";
exports.__esModule = true;
exports.fromSat = exports.estimateNumInOutputsForBuyInscription = exports.estimateNumInOutputs = exports.estimateTxFee = void 0;
var constants_1 = require("./constants");
/**
* estimateTxFee estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns returns the estimated transaction fee in satoshi
*/
var estimateTxFee = function (numIns, numOuts, feeRatePerByte) {
    var fee = (68 * numIns + 43 * numOuts) * feeRatePerByte;
    return fee;
};
exports.estimateTxFee = estimateTxFee;
/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters:
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
var estimateNumInOutputs = function (inscriptionID, sendAmount, isUseInscriptionPayFee) {
    var numOuts = 0;
    var numIns = 0;
    if (inscriptionID !== "") {
        numOuts++;
        numIns++;
    }
    if (sendAmount.gt(constants_1.BNZero)) {
        numOuts++;
    }
    if (sendAmount.gt(constants_1.BNZero) || !isUseInscriptionPayFee) {
        numIns++;
        numOuts++; // for change BTC output
    }
    return { numIns: numIns, numOuts: numOuts };
};
exports.estimateNumInOutputs = estimateNumInOutputs;
/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters:
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
var estimateNumInOutputsForBuyInscription = function (estNumInputsFromBuyer, estNumOutputsFromBuyer, sellerSignedPsbt) {
    var numIns = sellerSignedPsbt.txInputs.length + estNumInputsFromBuyer;
    var numOuts = sellerSignedPsbt.txOutputs.length + estNumOutputsFromBuyer;
    return { numIns: numIns, numOuts: numOuts };
};
exports.estimateNumInOutputsForBuyInscription = estimateNumInOutputsForBuyInscription;
var fromSat = function (sat) {
    return sat / 1e8;
};
exports.fromSat = fromSat;
