import dbConnect from "../config/postgres";
import fetch from "cross-fetch";
import { utils } from "near-api-js";
import BN from "bn.js";
import { PublicKey } from "near-api-js/lib/utils";
import axios from "axios";
import {
  sendTransferToken,
  swapNear,
  activateAccount,
  callsContractEnd,
} from "./near.services";
import { getAutoSwapsApollo } from "./apolloGraphql.services";

const decimals = 2;

const AutoSwap = async () => {
  try {
    const nearPrice = await axios.get("https://nearblocks.io/api/near-price");

    if (!nearPrice.data.usd) throw new Error("Error near usd");
    const nearUsd = nearPrice.data.usd;

    const dataForSwap = await getAutoSwapsApollo();

    let totalAmountNear = 0;

    for (const forSwap of dataForSwap) {
      totalAmountNear +=
        Number(utils.format.formatNearAmount(forSwap.amount)) +
        Number(utils.format.formatNearAmount(forSwap.tax));
    }
    console.log("TotalAmount: " + totalAmountNear);

    if (!(totalAmountNear > 0)) return;
    const resultSwap = await swapNear(totalAmountNear);

    if (!resultSwap) return;

    for (const item of dataForSwap) {
      let addressSend, addressTax;

      if (Number(item.artist_id) > 0) {
        const conexion = await dbConnect();
        const response = await conexion.query(
          "SELECT *\
          FROM backend_artist \
          where id_collection = $1",
          [item.artist_id]
        );

        if (response.rows.length === 0) throw new Error("Error db connection");

        addressSend = response.rows[0].account_near;
        addressTax = response.rows[0].account_near_tax;
      } else {
        addressSend = "mftftest.testnet";
        addressTax = "mftftest.testnet";
      }

      if (!addressSend || !addressTax) throw new Error("Error addreses");

      const sendUser =
        Number(utils.format.formatNearAmount(item.amount)) * nearUsd;
      const sendTax = Number(utils.format.formatNearAmount(item.tax)) * nearUsd;

      const sendUserEnd = Math.round(sendUser * Math.pow(10, decimals));
      const sendTaxEnd = Math.round(sendTax * Math.pow(10, decimals));

      const activated = await activateAccount(addressSend);
      const activatedTax = await activateAccount(addressTax);

      console.log("ACTIVATED", activated, activatedTax);

      if (!activated) return;

      const result = await sendTransferToken(
        addressSend,
        sendUserEnd,
        addressTax,
        sendTaxEnd
      );

      if (!result) return;

      await callsContractEnd(
        item.artist_id,
        item.amount,
        item.tax,
        "USDT",
        String(sendUserEnd + sendTaxEnd)
      );
    }
  } catch (error) {
    console.log("err");
    console.log(error);
    AutoSwap();
  }
};

export { AutoSwap };
