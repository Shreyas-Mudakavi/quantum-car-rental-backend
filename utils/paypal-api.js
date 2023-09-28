const axios = require("axios");
const qs = require("qs");
const dotenv = require("dotenv");
dotenv.config();

const { CLIENT_ID, APP_SECRET } = process.env;

const base = "https://api-m.paypal.com";
// const base = "https://api-m.sandbox.paypal.com";
// generate access token
const generateAccessToken = async () => {
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
  const url = `${base}/v1/oauth2/token`;
  const axiosData = { grant_type: "client_credentials" };
  try {
    const { data } = await axios.post(url, qs.stringify(axiosData), {
      headers: { Authorization: `Basic ${auth}` },
    });

    // console.log("gene access ", data);
    return data.access_token;
  } catch (error) {
    console.log("gene access err", error);
  }
};

// generate client token
const generateClientToken = async () => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v1/identity/generate-token`;
  const { data } = await axios.post(
    url,
    { grant_type: "client_credentials" },
    {
      headers: {
        Authorization: `Basic ${accessToken}`,
        "Accept-Language": "en_US",
      },
      "Content-Type": "application/json",
    }
  );
  console.log("response client token ", data.status);

  return data.client_token;
};

module.exports = { generateAccessToken, generateClientToken };
