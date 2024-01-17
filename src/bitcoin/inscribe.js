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
exports.btc_inscribe = exports.getInscribeTxsInfo = exports.chooseUTXOs = exports.getWalletNode = exports.generateAddress = exports.generateTaprootSigner = exports.getInscribeRevealTx = exports.signPSBTFromWallet = exports.getInscribeCommitTx = exports.generateRevealAddress = exports.splitByNChars = void 0;
var bitcoin = require("bitcoinjs-lib");
var bitcoinjs_lib_1 = require("bitcoinjs-lib");
var bip32_1 = require("bip32");
var _1 = require(".");
var secp256k1_1 = require("@bitcoinerlab/secp256k1");
var bip39_1 = require("bip39");
var wif_1 = require("wif");
var sizeEstimate_1 = require("./sizeEstimate");
var file_type_1 = require("file-type");
// Source - https://github.com/OrdinalSafe/ordinalsafe-extension/blob/e26ac38ed8717d62714dd75e6ea573fbd58b14c2/src/pages/Popup/pages/Inscribe.jsx#L70
var DUST_LIMIT = 546;
var bip32 = (0, bip32_1["default"])(secp256k1_1["default"]);
var splitByNChars = function (str, n) {
    var result = [];
    var i = 0;
    var len = str.length;
    while (i < len) {
        result.push(str.substring(i, n));
        i += n;
    }
    return result;
};
exports.splitByNChars = splitByNChars;
function parseTxId(txId) {
    var _a = txId.split("i"), id = _a[0], tag = _a[1];
    var hexId = Buffer.from(id, "hex").reverse();
    if (tag && tag !== "0") {
        var intTag = parseInt(tag);
        if (!isNaN(intTag))
            throw new Error("index is error");
        var hexTag = Buffer.from([intTag]);
        return Buffer.concat([hexId, hexTag]).toString("hex");
    }
    return hexId.toString("hex");
}
// 构建 reveal 脚本，将铭文内容写入其中。
var generateRevealAddress = function (xOnlyPubKey, mimeType, hexData, parentTxId, network) {
    var mimeTypeBuffer = Buffer.from(mimeType).toString("hex");
    var scriptString = "".concat(xOnlyPubKey.toString("hex"), " OP_CHECKSIG OP_0 OP_IF ").concat(Buffer.from("ord").toString("hex"), " OP_1 ").concat(mimeTypeBuffer);
    if (parentTxId) {
        scriptString += " 03 ".concat(parseTxId(parentTxId));
    }
    scriptString += " OP_0 ".concat((0, exports.splitByNChars)(hexData, 1040).join(" "), " OP_ENDIF");
    var inscribeLockScript = bitcoin.script.fromASM(scriptString);
    inscribeLockScript = Buffer.from(inscribeLockScript.toString("hex").replace("6f726451", "6f72640101"), "hex");
    if (parentTxId) {
        inscribeLockScript = Buffer.from(inscribeLockScript.toString("hex").replace(mimeTypeBuffer + "53", mimeTypeBuffer + "0103"), "hex");
    }
    console.log("script", inscribeLockScript.toString("hex"));
    var scriptTree = {
        output: inscribeLockScript
    };
    var inscribeLockRedeem = {
        output: inscribeLockScript,
        redeemVersion: 192
    };
    // console.log("network", network);
    var inscribeP2tr = bitcoin.payments.p2tr({
        internalPubkey: xOnlyPubKey,
        scriptTree: scriptTree,
        network: network,
        redeem: inscribeLockRedeem
    });
    var tapLeafScript = {
        leafVersion: inscribeLockRedeem.redeemVersion,
        script: inscribeLockRedeem.output || Buffer.from(""),
        controlBlock: inscribeP2tr.witness[inscribeP2tr.witness.length - 1]
    };
    return {
        p2tr: inscribeP2tr,
        tapLeafScript: tapLeafScript
    };
};
exports.generateRevealAddress = generateRevealAddress;
var utxoToPSBTInput = function (input, xOnlyPubKey) {
    return {
        hash: input.txId,
        index: input.index,
        witnessUtxo: {
            script: Buffer.from(input.script, "hex"),
            value: input.value
        },
        tapInternalKey: xOnlyPubKey
    };
};
var getInscribeCommitTx = function (inputs, committerAddress, revealerAddress, revealCost, change, xOnlyPubKey, serviceFee, serviceFeeReceiver, network) {
    if (inputs.length === 0)
        throw new Error("Not enough funds");
    var outputs = [
        {
            address: revealerAddress,
            value: revealCost
        },
    ];
    if (change !== 0) {
        outputs.push({
            address: committerAddress,
            value: change
        });
    }
    if (serviceFee > 0) {
        outputs.push({
            value: serviceFee,
            address: serviceFeeReceiver
        });
    }
    var psbt = new bitcoin.Psbt({ network: network });
    inputs.forEach(function (input) {
        psbt.addInput(utxoToPSBTInput(input, xOnlyPubKey));
    });
    outputs.forEach(function (output) {
        psbt.addOutput(output);
    });
    return psbt;
};
exports.getInscribeCommitTx = getInscribeCommitTx;
var signPSBTFromWallet = function (signer, psbt) {
    (0, bitcoinjs_lib_1.initEccLib)(secp256k1_1["default"]);
    try {
        for (var i = 0; i < psbt.inputCount; i++) {
            psbt.signTaprootInput(i, signer);
        }
        // psbt.signAllInputs(signer);
    }
    catch (error) {
        console.log(error, "signPSBTFromWallet error");
    }
    psbt.finalizeAllInputs();
    return psbt.extractTransaction();
};
exports.signPSBTFromWallet = signPSBTFromWallet;
// 构建revealTx
var getInscribeRevealTx = function (commitHash, commitIndex, revealCost, postageSize, receiverAddress, inscriberOutputScript, xOnlyPubKey, tapLeafScript, websiteFeeReceiver, websiteFeeInSats, network) {
    if (websiteFeeReceiver === void 0) { websiteFeeReceiver = null; }
    if (websiteFeeInSats === void 0) { websiteFeeInSats = null; }
    var psbt = new bitcoin.Psbt({ network: network });
    // 3. 创建一个 SatPoint，也就是铭文所在的 OutPoint。
    psbt.addInput({
        hash: commitHash,
        index: commitIndex,
        witnessUtxo: {
            script: inscriberOutputScript || Buffer.from(""),
            value: revealCost
        },
        tapInternalKey: xOnlyPubKey,
        tapLeafScript: [tapLeafScript]
    });
    psbt.addOutput({
        address: receiverAddress,
        value: postageSize
    });
    if (websiteFeeReceiver && websiteFeeInSats) {
        psbt.addOutput({
            address: websiteFeeReceiver,
            value: websiteFeeInSats
        });
    }
    return psbt;
};
exports.getInscribeRevealTx = getInscribeRevealTx;
var generateTaprootSigner = function (node) {
    var xOnlyPubKey = node.publicKey.slice(1, 33);
    return node.tweak(bitcoin.crypto.taggedHash("TapTweak", xOnlyPubKey));
};
exports.generateTaprootSigner = generateTaprootSigner;
var generateAddress = function (masterNode, path, isTestNet) {
    if (path === void 0) { path = 0; }
    if (isTestNet === void 0) { isTestNet = false; }
    return isTestNet
        ? masterNode.derivePath("m/86'/0'/0'/0/".concat(path))
        : masterNode.derivePath("m/86'/0'/0'/0/".concat(path));
};
exports.generateAddress = generateAddress;
var getWalletNode = function (senderMnemonic, isTestNet) {
    if (isTestNet === void 0) { isTestNet = false; }
    var network = isTestNet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    var seed = (0, bip39_1.mnemonicToSeedSync)(senderMnemonic);
    var masterNode = bip32.fromSeed(seed, network);
    var address = (0, exports.generateAddress)(masterNode, 0, isTestNet);
    var decoded = wif_1["default"].decode(address.toWIF(), address.network.wif);
    return bip32.fromPrivateKey(decoded.privateKey, address.chainCode, network);
};
exports.getWalletNode = getWalletNode;
var chooseUTXOs = function (utxos, amount) {
    var lessers = utxos.filter(function (utxo) { return utxo.value < amount; });
    var greaters = utxos.filter(function (utxo) { return utxo.value >= amount; });
    if (greaters.length > 0) {
        var min = void 0;
        var minUTXO = void 0;
        for (var _i = 0, greaters_1 = greaters; _i < greaters_1.length; _i++) {
            var utxo = greaters_1[_i];
            if (!min || utxo.value < min) {
                min = utxo.value;
                minUTXO = utxo;
            }
        }
        if (minUTXO) {
            var change = minUTXO.value - amount;
            return { chosenUTXOs: [minUTXO], change: change };
        }
        else {
            return { chosenUTXOs: [], change: 0 };
        }
    }
    else {
        lessers.sort(function (a, b) { return b.value - a.value; });
        var sum = 0;
        var chosen = [];
        for (var _a = 0, lessers_1 = lessers; _a < lessers_1.length; _a++) {
            var utxo = lessers_1[_a];
            if (utxo.value < DUST_LIMIT)
                throw new Error("Amount requires usage of dust UTXOs. Set smaller amount");
            sum += utxo.value;
            chosen.push(utxo);
            if (sum >= amount)
                break;
        }
        if (sum < amount)
            return { chosenUTXOs: [], change: 0 };
        var change = sum - amount;
        return { chosenUTXOs: chosen, change: change };
    }
};
exports.chooseUTXOs = chooseUTXOs;
var getOutputAddressTypeCounts = function (addresses, network) {
    var p2pkh = 0;
    var p2sh = 0;
    var p2wpkh = 0;
    var p2wsh = 0;
    var p2tr = 0;
    if (JSON.stringify(network) === JSON.stringify(bitcoin.networks.testnet)) {
        addresses.forEach(function (address) {
            if (address.startsWith("tb1p"))
                p2tr++;
            else if (address.startsWith("3"))
                p2sh++;
            else if (address.startsWith("1"))
                p2pkh++;
            else if (address.startsWith("tb1q")) {
                var decodeBech32 = bitcoin.address.fromBech32(address);
                if (decodeBech32.data.length === 20)
                    p2wpkh++;
                if (decodeBech32.data.length === 32)
                    p2wsh++;
            }
            else {
                p2tr++; // if you don't know type assum taproot bc it has the highset size for outputs
            }
        });
    }
    else {
        addresses.forEach(function (address) {
            if (address.startsWith("bc1p"))
                p2tr++;
            else if (address.startsWith("3"))
                p2sh++;
            else if (address.startsWith("1"))
                p2pkh++;
            else if (address.startsWith("bc1q")) {
                var decodeBech32 = bitcoin.address.fromBech32(address);
                if (decodeBech32.data.length === 20)
                    p2wpkh++;
                if (decodeBech32.data.length === 32)
                    p2wsh++;
            }
            else {
                p2tr++; // if you don't know type assum taproot bc it has the highset size for outputs
            }
        });
    }
    return { p2pkh: p2pkh, p2sh: p2sh, p2wpkh: p2wpkh, p2wsh: p2wsh, p2tr: p2tr };
};
var getInscribeTxsInfo = function (utxos, data, sender, feeRate, serviceFee, serviceFeeReceiver, // to use in outputs size calculation
btcPrice, // in USD
websiteFeeInSats, network) {
    var _a;
    var POSTAGE_SIZE = 546;
    // 1 input 1 output taproot tx size 111 vBytes
    // some safety buffer + data size / 4
    var hexData = Buffer.from(data);
    var REVEAL_TX_SIZE = (websiteFeeInSats ? 180 : 137) + hexData.length / 4;
    var SERVICE_FEE = Math.ceil((serviceFee / btcPrice) * 100000000);
    var REVEAL_COST = POSTAGE_SIZE + (websiteFeeInSats || 0) + Math.ceil(REVEAL_TX_SIZE * feeRate);
    var chosenUTXOs = [];
    var change;
    var knownSize = 0;
    var newSize = 0;
    do {
        knownSize = newSize;
        (_a = (0, exports.chooseUTXOs)(utxos, REVEAL_COST + SERVICE_FEE + Math.ceil(knownSize * feeRate)), chosenUTXOs = _a.chosenUTXOs, change = _a.change);
        if (chosenUTXOs.length === 0)
            throw new Error("Not enough funds");
        var addresses = [];
        if (change !== 0)
            addresses.push(sender);
        if (SERVICE_FEE !== 0)
            addresses.push(serviceFeeReceiver);
        var outputAddressTypeCounts = getOutputAddressTypeCounts(addresses, network);
        newSize = Math.ceil((0, sizeEstimate_1.getTxSize)(chosenUTXOs.length, "P2TR", 1, 1, outputAddressTypeCounts.p2pkh, outputAddressTypeCounts.p2sh, 0, 0, outputAddressTypeCounts.p2wpkh, outputAddressTypeCounts.p2wsh, outputAddressTypeCounts.p2tr + 1 // +1 for reveal address
        ).vBytes);
    } while (knownSize !== newSize);
    var COMMIT_TX_SIZE = knownSize;
    var COMMIT_COST = REVEAL_COST + SERVICE_FEE + Math.ceil(COMMIT_TX_SIZE * feeRate);
    return {
        chosenUTXOs: chosenUTXOs,
        change: change,
        commitCost: COMMIT_COST,
        commitSize: COMMIT_TX_SIZE,
        revealCost: REVEAL_COST,
        revealSize: REVEAL_TX_SIZE,
        serviceFee: SERVICE_FEE,
        postageSize: POSTAGE_SIZE
    };
};
exports.getInscribeTxsInfo = getInscribeTxsInfo;
var btc_inscribe = function (senderMnemonic, data, parent, websiteFeeReceiver, websiteFeeInSats, inscriptionReceiver, chosenUTXOs, // 1.准备铸造的内容和可用的 UTXO。
committerAddress, revealCost, change, 
// feeRete: number,
serviceFee, network, postageSize, isTestNet) { return __awaiter(void 0, void 0, void 0, function () {
    var walletNode, tweakedSigner, mime, senderPrivateKey, keyPair, internalPubKey, hexData, _a, revealAddress, tapLeafScript, commitPSBT, commitTx, revealPSBT, revealTx, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                (0, _1.setBTCNetwork)(isTestNet ? _1.NetworkType.Testnet : _1.NetworkType.Mainnet);
                walletNode = (0, exports.getWalletNode)(senderMnemonic, isTestNet);
                tweakedSigner = (0, exports.generateTaprootSigner)(walletNode);
                return [4 /*yield*/, (0, file_type_1.fileTypeFromBuffer)(data)];
            case 1:
                mime = (_b.sent()).mime;
                return [4 /*yield*/, (0, _1.mnemonicToTaprootPrivateKey)(senderMnemonic, isTestNet)];
            case 2:
                senderPrivateKey = _b.sent();
                keyPair = (0, _1.generateTaprootKeyPair)(senderPrivateKey).keyPair;
                internalPubKey = (0, _1.toXOnly)(keyPair.publicKey);
                hexData = data.toString("hex");
                _a = (0, exports.generateRevealAddress)(Buffer.from(internalPubKey), mime, hexData, parent, _1.Network), revealAddress = _a.p2tr, tapLeafScript = _a.tapLeafScript;
                commitPSBT = (0, exports.getInscribeCommitTx)(chosenUTXOs, committerAddress, revealAddress.address, revealCost, change, Buffer.from(internalPubKey), serviceFee.feeAmount, serviceFee.feeReceiver, network);
                commitTx = (0, exports.signPSBTFromWallet)(tweakedSigner, commitPSBT);
                revealPSBT = (0, exports.getInscribeRevealTx)(commitTx.getHash(), 0, revealCost, postageSize, inscriptionReceiver, revealAddress.output, revealAddress.internalPubkey, tapLeafScript, websiteFeeReceiver, websiteFeeInSats, _1.Network);
                revealTx = (0, exports.signPSBTFromWallet)(walletNode, revealPSBT);
                // console.log("reveal tx size", revealTx.virtualSize());
                return [2 /*return*/, {
                        commit: commitTx.getId(),
                        commitHex: commitTx.toHex(),
                        revealHex: revealTx.toHex(),
                        reveal: revealTx.getId()
                    }];
            case 3:
                error_1 = _b.sent();
                console.log(error_1);
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.btc_inscribe = btc_inscribe;
