import "dotenv/config";
import { v4 as uuid } from "uuid";
//import dbConnect from "../config/postgres";
//import fetch from "cross-fetch";
import { utils } from "near-api-js";
import { getListRedeemer, getWalletArtistId } from "./apolloGraphql";
//import { getNearPrice } from "./utils";
import { Request, Response } from "express";
import axios from "axios";
import dbConnect from "../../config/postgres";

const sendRedeemer = async (req: Request, res: Response) => {
  try {
    let dataRedeem = await getListRedeemer();
    let i = 1;

    for (const data of dataRedeem) {
      const extra = JSON.parse(data.extra);

      let conexion = await dbConnect();
      const resultados = await conexion.query("select * from backend_orderredeem where token_id = $1", [data.id]);

      // console.log(resultados.rows);

      if (resultados.rows.length === 0) {
        continue;
      }

      // console.log(JSON.parse(extra));

      const dataOrder = resultados.rows[0];

      if (!dataOrder.sku) continue;

      const addresUser = {
        name: dataOrder.city,
        nameLine2: dataOrder.city,
        addressLine1: dataOrder.street_address,
        addressLine2: dataOrder.street_address,
        city: dataOrder.city,
        state: dataOrder.state,
        postalCode: dataOrder.postal,
        country: dataOrder.country,
        phone: dataOrder.phone_number,
      };

      const idOrder = uuid();

      const orderPost = {
        // campaignId: "123456",
        confirmationEmailAddress: dataOrder.email,
        // customerAddress: addresUser,
        // customerEmailAddress: dataOrder.email || "juanochandoa@gmail.com",
        customId: idOrder,
        holdFulfillmentUntilDate: null,
        isTest: true,
        orderItemGroups: [
          {
            declaredValue: 1,
            designData: {
              artwork: [
                {
                  mockups: [
                    {
                      mockupUrl: extra.ArtWork,
                    },
                  ],
                  originalFileUrl: extra.ArtWork,
                  physicalPlacement: extra.physicalPlacement,
                  physicalSize: extra.physicalSize,
                  printingMethod: "dtg",
                  printLocation: "front",
                },
              ],
            },
            id: idOrder,
            sku: dataOrder.sku,
            quantity: 1,
          },
        ],
        shipments: [
          {
            confirmationEmailAddress: dataOrder.email,
            customId: idOrder,
            // customPackingSlipUrl: null,
            // giftMessage: null,
            // items: [
            //   {
            //     orderItemGroupId: "123456",
            //     quantity: 1,
            //   },
            // ],
            // returnToAddress: addresUser,
            shippingAddress: addresUser,
            shippingTier: "economy",
            // shippingCarrier: null,
            // shippingService: null,
          },
        ],
      };

      await axios
        .post(process.env.API_FULFILL_URL as string, orderPost, {
          headers: {
            "x-api-key": process.env.API_KEY_FULFILL,
          },
        })
        .then((response) => {
          console.log("Connect Success");
          console.log(response.data);
          console.log(extra);
          i++;
        })
        .catch((err) => {
          console.log("Error");
          if (i === 1) {
            console.error(err.response.data);
            console.log(extra.ArtWork);
            console.log(extra);
          }
          i++;
        });
    }

    res.send(dataRedeem);
  } catch (error) {
    // console.log("err");
    // console.log(error);
    res.status(500).json();
    return;
    // AutoSwap();
  }
};

export { sendRedeemer };
