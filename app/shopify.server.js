import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import prisma from "./db.server";

// const shopify = shopifyApp({
//   apiKey: process.env.SHOPIFY_API_KEY,
//   apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
//   apiVersion: ApiVersion.July24,
//   scopes: process.env.SCOPES?.split(","),
//   appUrl: process.env.SHOPIFY_APP_URL || "",
//   authPathPrefix: "/auth",
//   sessionStorage: new PrismaSessionStorage(prisma),
//   distribution: AppDistribution.AppStore,
//   restResources,
//   future: {
//     unstable_newEmbeddedAuthStrategy: true,
//   },
//   ...(process.env.SHOP_CUSTOM_DOMAIN
//     ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
//     : {}),
// });



const express = require('express');
const dotenv = require('dotenv');
const Shopify = require('shopify-api-node');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Shopify API client
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOP_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_ACCESS_TOKEN
});

app.use(express.json());

// Routes
app.get('/fetch-top-rated-products', async (req, res) => {
  try {
    const products = await fetchTopRatedProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/create-top-rated-collection', async (req, res) => {
  try {
    const products = await fetchTopRatedProducts();
    const collection = await createTopRatedCollection(products);
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function fetchTopRatedProducts() {
  // Dummy data for demonstration
  const topRatedProductIds = ['123456789', '987654321']; // Assume these are your top-rated product IDs
  const products = await shopify.product.list({ ids: topRatedProductIds.join(',') });
  return products;
}

async function createTopRatedCollection(products) {
  const collectionData = {
    title: 'Top Rated Products',
    body_html: '<p>These are our highest-rated products!</p>'
  };
  const collection = await shopify.customCollection.create(collectionData);
  for (let product of products) {
    await shopify.collect.create({
      collection_id: collection.id,
      product_id: product.id
    });
  }
  return collection;
}




export default shopify;
export const apiVersion = ApiVersion.July24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
