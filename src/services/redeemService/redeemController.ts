import "dotenv/config";
//import dbConnect from "../config/postgres";
//import fetch from "cross-fetch";
import { utils } from "near-api-js";
import { getListRedeemer, getWalletArtistId } from "./apolloGraphql";
//import { getNearPrice } from "./utils";
import { Request, Response } from "express";
import axios from "axios";

const sendRedeemer = async (req: Request, res: Response) => {
  try {
    let dataRedeem = await getListRedeemer();

    for (const data of dataRedeem) {
      const extra = data.extra;
      console.log(JSON.parse(extra));
      const orderPost = {
        campaignId: "string",
        confirmationEmailAddress: "string",
        customerAddress: {
          name: "string",
          nameLine2: "string",
          addressLine1: "string",
          addressLine2: "string",
          city: "string",
          state: "string",
          postalCode: "string",
          country: "string",
          phone: "string",
        },
        customerEmailAddress: "string",
        customId: "string",
        holdFulfillmentUntilDate: "2023-05-30T13:13:05.116Z",
        isTest: true,
        orderItemGroups: [
          {
            countryOfOrigin: "string",
            customsDescription: "string",
            declaredValue: 0,
            designId: "string",
            designData: {
              artwork: [
                {
                  embroideryMetadata: {
                    dstFileUrl: "string",
                    text: "string",
                    threadColors: [
                      {
                        code: "string",
                        brand: "string",
                      },
                    ],
                  },
                  mockups: [
                    {
                      mockupUrl: "string",
                    },
                  ],
                  originalFileUrl: "string",
                  physicalPlacement: {
                    horizontalPlacementFromCenterInInches: 0,
                    verticalPlacementInInches: 0,
                  },
                  physicalSize: {
                    widthInches: 0,
                    heightInches: 0,
                  },
                  printingMethod: "string",
                  printLocation: "string",
                },
              ],
            },
            gtin: "string",
            htsCode: "string",
            id: "string",
            quantity: 0,
            sku: "string",
            vendorSKU: "string",
          },
        ],
        shipments: [
          {
            confirmationEmailAddress: "string",
            customId: "string",
            customPackingSlipUrl: "string",
            giftMessage: "string",
            items: [
              {
                orderItemGroupId: "string",
                quantity: 0,
              },
            ],
            returnToAddress: {
              name: "string",
              nameLine2: "string",
              addressLine1: "string",
              addressLine2: "string",
              city: "string",
              state: "string",
              postalCode: "string",
              country: "string",
              phone: "string",
            },
            shippingAddress: {
              name: "string",
              nameLine2: "string",
              addressLine1: "string",
              addressLine2: "string",
              city: "string",
              state: "string",
              postalCode: "string",
              country: "string",
              phone: "string",
            },
            shippingTier: "string",
            shippingCarrier: "string",
            shippingService: "string",
          },
        ],
      };

      const res = await axios
        .post(process.env.API_FULFILL_URL as string, orderPost, {
          headers: {
            "x-api-key": process.env.API_KEY_FULFILL,
          },
        })
        .then((response) => {
          console.log("Connect Success");
          console.log(response);
        })
        .catch((err) => {
          console.error(err);
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