"use strict";
exports.__esModule = true;
exports.setBTCNetwork = exports.NetworkType = exports.Network = void 0;
var bitcoinjs_lib_1 = require("bitcoinjs-lib");
// default is bitcoin mainnet
var Network = bitcoinjs_lib_1.networks.bitcoin;
exports.Network = Network;
var NetworkType = {
    Mainnet: 1,
    Testnet: 2,
    Regtest: 3
};
exports.NetworkType = NetworkType;
var setBTCNetwork = function (netType) {
    switch (netType) {
        case NetworkType.Mainnet: {
            exports.Network = Network = bitcoinjs_lib_1.networks.bitcoin;
            break;
        }
        case NetworkType.Testnet: {
            exports.Network = Network = bitcoinjs_lib_1.networks.testnet;
            break;
        }
        case NetworkType.Regtest: {
            exports.Network = Network = bitcoinjs_lib_1.networks.regtest;
            break;
        }
    }
};
exports.setBTCNetwork = setBTCNetwork;
