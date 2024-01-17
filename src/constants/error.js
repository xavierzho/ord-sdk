"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a;
exports.__esModule = true;
exports.ERROR_MESSAGE = exports.ERROR_CODE = void 0;
exports.ERROR_CODE = {
    INVALID_CODE: "0",
    INVALID_PARAMS: "-1",
    NOT_SUPPORT_SEND: "-2",
    NOT_FOUND_INSCRIPTION: "-3",
    NOT_ENOUGH_BTC_TO_SEND: "-4",
    NOT_ENOUGH_BTC_TO_PAY_FEE: "-5",
    ERR_BROADCAST_TX: "-6",
    INVALID_SIG: "-7",
    INVALID_VALIDATOR_LABEL: "-8",
    NOT_FOUND_UTXO: "-9",
    NOT_FOUND_DUMMY_UTXO: "-10",
    WALLET_NOT_SUPPORT: "-11",
    SIGN_XVERSE_ERROR: "-12",
    CREATE_COMMIT_TX_ERR: "-13",
    INVALID_TAPSCRIPT_ADDRESS: "-14"
};
exports.ERROR_MESSAGE = (_a = {},
    _a[exports.ERROR_CODE.INVALID_CODE] = {
        message: "Something went wrong.",
        desc: "Something went wrong."
    },
    _a[exports.ERROR_CODE.INVALID_PARAMS] = {
        message: "Invalid input params.",
        desc: "Invalid input params."
    },
    _a[exports.ERROR_CODE.NOT_SUPPORT_SEND] = {
        message: "This inscription is not supported to send.",
        desc: "This inscription is not supported to send."
    },
    _a[exports.ERROR_CODE.NOT_FOUND_INSCRIPTION] = {
        message: "Can not find inscription UTXO in your wallet.",
        desc: "Can not find inscription UTXO in your wallet."
    },
    _a[exports.ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND] = {
        message: "Your balance is insufficient. Please top up BTC to your wallet.",
        desc: "Your balance is insufficient. Please top up BTC to your wallet."
    },
    _a[exports.ERROR_CODE.NOT_ENOUGH_BTC_TO_PAY_FEE] = {
        message: "Your balance is insufficient. Please top up BTC to pay network fee.",
        desc: "Your balance is insufficient. Please top up BTC to pay network fee."
    },
    _a[exports.ERROR_CODE.ERR_BROADCAST_TX] = {
        message: "There was an issue when broadcasting the transaction to the BTC network.",
        desc: "There was an issue when broadcasting the transaction to the BTC network."
    },
    _a[exports.ERROR_CODE.INVALID_SIG] = {
        message: "Signature is invalid in the partially signed bitcoin transaction.",
        desc: "Signature is invalid in the partially signed bitcoin transaction."
    },
    _a[exports.ERROR_CODE.INVALID_VALIDATOR_LABEL] = {
        message: "Missing or invalid label.",
        desc: "Missing or invalid label."
    },
    _a[exports.ERROR_CODE.NOT_FOUND_UTXO] = {
        message: "Can not find UTXO with exact value.",
        desc: "Can not find UTXO with exact value."
    },
    _a[exports.ERROR_CODE.NOT_FOUND_DUMMY_UTXO] = {
        message: "Can not find dummy UTXO in your wallet.",
        desc: "Can not find dummy UTXO in your wallet."
    },
    _a[exports.ERROR_CODE.SIGN_XVERSE_ERROR] = {
        message: "Can not sign with Xverse.",
        desc: "Can not sign with Xverse."
    },
    _a[exports.ERROR_CODE.WALLET_NOT_SUPPORT] = {
        message: "Your wallet is not supported currently.",
        desc: "Your wallet is not supported currently."
    },
    _a[exports.ERROR_CODE.CREATE_COMMIT_TX_ERR] = {
        message: "Create commit tx error.",
        desc: "Create commit tx error."
    },
    _a[exports.ERROR_CODE.INVALID_TAPSCRIPT_ADDRESS] = {
        message: "Can not generate valid tap script address to inscribe.",
        desc: "Can not generate valid tap script address to inscribe."
    },
    _a);
var SDKError = /** @class */ (function (_super) {
    __extends(SDKError, _super);
    function SDKError(code, desc) {
        var _this = _super.call(this) || this;
        var _error = exports.ERROR_MESSAGE[code];
        _this.message = "".concat(_error.message, " (").concat(code, ")") || "";
        _this.code = code;
        _this.desc = desc || (_error === null || _error === void 0 ? void 0 : _error.desc);
        return _this;
    }
    SDKError.prototype.getMessage = function () {
        return this.message;
    };
    return SDKError;
}(Error));
exports["default"] = SDKError;
