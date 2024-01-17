"use strict";
exports.__esModule = true;
var bitcoin_1 = require("../bitcoin");
var error_1 = require("../constants/error");
var bitcoinjs_lib_1 = require("bitcoinjs-lib");
function isPrivateKey(privateKey) {
    var isValid = false;
    try {
        // init key pair from senderPrivateKey
        var keyPair = bitcoin_1.ECPair.fromPrivateKey(privateKey);
        // Tweak the original keypair
        var tweakedSigner = (0, bitcoin_1.tweakSigner)(keyPair, { network: bitcoin_1.Network });
        // Generate an address from the tweaked public key
        var p2pktr = bitcoinjs_lib_1.payments.p2tr({
            pubkey: (0, bitcoin_1.toXOnly)(tweakedSigner.publicKey),
            network: bitcoin_1.Network
        });
        var senderAddress = p2pktr.address ? p2pktr.address : "";
        isValid = senderAddress !== "";
    }
    catch (e) {
        isValid = false;
    }
    return isValid;
}
var Validator = /** @class */ (function () {
    function Validator(label, value) {
        if (!label && typeof label !== "string") {
            throw new error_1["default"](error_1.ERROR_CODE.INVALID_VALIDATOR_LABEL);
        }
        this.value = value;
        this.label = label;
        this.isRequired = false;
    }
    Validator.prototype._throwError = function (message) {
        throw new Error("Validating \"".concat(this.label, "\" failed: ").concat(message, ". Found ").concat(this.value, " (type of ").concat(typeof this.value, ")"));
    };
    Validator.prototype._isDefined = function () {
        return this.value !== null && this.value !== undefined;
    };
    Validator.prototype._onCondition = function (condition, message) {
        if (((!this.isRequired && this._isDefined()) || this.isRequired) &&
            !condition()) {
            this._throwError(message);
        }
        return this;
    };
    Validator.prototype.required = function (message) {
        var _this = this;
        if (message === void 0) { message = "Required"; }
        this.isRequired = true;
        return this._onCondition(function () { return _this._isDefined(); }, message);
    };
    Validator.prototype.string = function (message) {
        var _this = this;
        if (message === void 0) { message = "Must be string"; }
        return this._onCondition(function () { return typeof _this.value === "string"; }, message);
    };
    Validator.prototype.buffer = function (message) {
        var _this = this;
        if (message === void 0) { message = "Must be buffer"; }
        return this._onCondition(function () { return Buffer.isBuffer(_this.value); }, message);
    };
    Validator.prototype["function"] = function (message) {
        var _this = this;
        if (message === void 0) { message = "Must be a function"; }
        return this._onCondition(function () { return typeof _this.value === "function"; }, message);
    };
    Validator.prototype.boolean = function (message) {
        var _this = this;
        if (message === void 0) { message = "Must be boolean"; }
        return this._onCondition(function () { return typeof _this.value === "boolean"; }, message);
    };
    Validator.prototype.number = function (message) {
        var _this = this;
        if (message === void 0) { message = "Must be number"; }
        return this._onCondition(function () { return Number.isFinite(_this.value); }, message);
    };
    Validator.prototype.array = function (message) {
        var _this = this;
        if (message === void 0) { message = "Must be array"; }
        return this._onCondition(function () { return _this.value instanceof Array; }, message);
    };
    Validator.prototype.privateKey = function (message) {
        var _this = this;
        if (message === void 0) { message = "Invalid private key"; }
        return this._onCondition(function () { return _this.buffer() && isPrivateKey(_this.value); }, message);
    };
    return Validator;
}());
exports["default"] = Validator;
