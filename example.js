// import {btc_inscribe} from "./build/compiled/bitcoin/inscribe.js";
// import {getAllUnspentTransactions_mempool} from "./build/compiled/bitcoin/btc.js";
// import * as bitcoin from "bitcoinjs-lib";
const taproot = import("./dist/index.js");
const bitcoin = require("bitcoinjs-lib");
const axios = require("axios");
const mnm = "drum income another adjust head ripple casino profit pretty weird fever reveal";


async function main() {
  const utxos = await taproot.getAllUnspentTransactions_mempool("tb1ppapu55h68424s7t55ra42yfr9xs0pm24x93utu2xyvdx8tuagk6sa8th00", "BTC_TAPROOT", true);
  // console.log(utxos);
  const parsedUtxos =
    utxos?.length > 0
      ? utxos?.map((utxo) => ({
        ...utxo,
        txId: utxo.hash,
        // status: "mined",
      }))
      : [];

  console.log(parsedUtxos, "parsedUtxos");
  const respo = await taproot.btc_inscribe(mnm,
    Buffer.from("Hello World!"),
    // "01c79fbf9d90afc2d081db8ba1c6d823e48dfa5673f88ad455575a9b941f8f63i0",
    null,
    null,
    null,
    "tb1ppapu55h68424s7t55ra42yfr9xs0pm24x93utu2xyvdx8tuagk6sa8th00",
    parsedUtxos,
    "tb1ppapu55h68424s7t55ra42yfr9xs0pm24x93utu2xyvdx8tuagk6sa8th00",
    700,
    10,
    {
      feeAmount: 0,
      feeReceiver: "tb1ppapu55h68424s7t55ra42yfr9xs0pm24x93utu2xyvdx8tuagk6sa8th00",
    },
    bitcoin.networks.testnet,
    10,
    true
  );
  console.log(respo);
  // let commitTxResp= await sendRawTransaction(respo.commitHex);
  // console.log(commitTxResp);
  // let revealTxResp= await sendRawTransaction(respo.revealHex);
  // console.log(revealTxResp);
}

async function sendRawTransaction(txHex) {
  let resp;
  // eslint-disable-next-line no-useless-catch
  try {
    resp = await axios.post("https://neat-withered-dinghy.btc-testnet.quiknode.pro/c8087a63117e6b5126a89b14c766ba4d13a2b2ab/", {
      method: "sendrawtransaction",
      params: [txHex],
    });
  } catch (e) {
    // 输出错误响应体的内容
    if (e.response) {
      // 如果存在响应体，打印出来
      console.error("Error response:", e.response.data);
    } else {
      // 如果没有响应体，打印错误对象本身
      console.error("Error:", e);
    }
    throw e;
  }
  return resp.data;
}

// console.log(bitcoin.script.fromASM(`03`));

main().then(() => {
  console.log("done");
}).catch((err) => {
  console.log(err);
});

// 20b2af12f10ff0b3f2ba7a040ec738c38ab7d9cee1a6eef6b3087ef86460f99f09ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38000c48656c6c6f20576f726c642168
// 20b2af12f10ff0b3f2ba7a040ec738c38ab7d9cee1a6eef6b3087ef86460f99f09ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38010320638f1f949b5a5755d48af87356fa8de423d8c6a18bdb81d0c2af909dbf9fc701000c48656c6c6f20576f726c642168

