"use strict";
exports.__esModule = true;
exports.estimateInscribeFee = void 0;
var constants_1 = require("../bitcoin/constants");
var __1 = require("..");
var bignumber_js_1 = require("bignumber.js");
var getRevealVirtualSizeByDataSize = function (dataSize) {
    var inputSize = constants_1.InputSize + dataSize;
    return inputSize + constants_1.OutputSize;
};
/**
* estimateInscribeFee estimate BTC amount need to inscribe for creating project.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param htmlFileSizeByte size of html file from user (in byte)
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the total BTC fee
*/
var estimateInscribeFee = function (_a) {
    var htmlFileSizeByte = _a.htmlFileSizeByte, feeRatePerByte = _a.feeRatePerByte;
    var estCommitTxFee = (0, __1.estimateTxFee)(1, 2, feeRatePerByte);
    var revealVByte = getRevealVirtualSizeByDataSize((htmlFileSizeByte + 24000) / 4); // 24k for contract size
    var estRevealTxFee = revealVByte * feeRatePerByte;
    var totalFee = estCommitTxFee + estRevealTxFee;
    return { totalFee: new bignumber_js_1["default"](totalFee) };
};
exports.estimateInscribeFee = estimateInscribeFee;
