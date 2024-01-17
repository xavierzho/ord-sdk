"use strict";
exports.__esModule = true;
exports.WalletType = exports.BNZero = exports.OutputSize = exports.InputSize = exports.DummyUTXOValue = exports.MinSats = exports.BlockStreamURL = void 0;
var bignumber_js_1 = require("bignumber.js");
var BlockStreamURL = "https://blockstream.info/api";
exports.BlockStreamURL = BlockStreamURL;
var MinSats = 1000;
exports.MinSats = MinSats;
var DummyUTXOValue = 1000;
exports.DummyUTXOValue = DummyUTXOValue;
var InputSize = 68;
exports.InputSize = InputSize;
var OutputSize = 43;
exports.OutputSize = OutputSize;
var BNZero = new bignumber_js_1["default"](0);
exports.BNZero = BNZero;
var WalletType = {
    Xverse: 1,
    Hiro: 2
};
exports.WalletType = WalletType;
