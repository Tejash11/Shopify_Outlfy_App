import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // server.js or a specific route file

  const express = require('express');
  const router = express.Router();

  // server.js or a specific route file
  const ShopifyAPI = require('./path-to-shopify-api-wrapper');
  const getRatings = require('./path-to-ratings-function');

  // Your existing fetchTopRatedProducts function
  const fetchTopRatedProducts = async () => {
    const ratings = await getRatings(); // Your function to get ratings
    const topRatedIds = ratings.sort((a, b) => b.rating - a.rating).map(rating => rating.productId).slice(0, 10);

    const products = await ShopifyAPI.getProducts({
      ids: topRatedIds.join(',')
    });

    return products;
  };

  // Your new createTopRatedCollection function
  const createTopRatedCollection = async (products) => {
    const collection = await ShopifyAPI.createCollection({
      title: 'Top Rated Products',
      body_html: '<p>These are our highest-rated products!</p>'
    });

    for (let product of products) {
      await ShopifyAPI.addProductToCollection(collection.id, product.id);
    }

    return collection;
  };

  // Define a route to create the top-rated products collection
  router.get('/create-top-rated-collection', async (req, res) => {
    try {
      const products = await fetchTopRatedProducts();
      const collection = await createTopRatedCollection(products);
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create top-rated collection' });
    }
  });

  module.exports = router;



  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return json({ showForm: Boolean(login) });
};

// controllers/productController.js

const Shopify = require('shopify-api-node');
require('dotenv').config();

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOP_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_ACCESS_TOKEN
});

// Function to fetch top-rated product IDs (from your database or other source)
async function getTopRatedProductIds() {
  // Example data, replace with your database query
  return ['123456789', '987654321'];
}

// Controller function to fetch products from Shopify
exports.fetchTopRatedProducts = async (req, res) => {
  try {
    const topRatedProductIds = await getTopRatedProductIds();
    const products = await shopify.product.list({ ids: topRatedProductIds.join(',') });
    res.status(200).json({ message: 'Top rated products fetched successfully', data: products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error });
  }
};

// Controller function to create a collection and add products
exports.createTopRatedCollection = async (req, res) => {
  try {
    const topRatedProductsResponse = await new Promise((resolve, reject) => {
      exports.fetchTopRatedProducts(req, {
        status: (code) => ({
          json: (response) => resolve(response),
        }),
      });
    });

    const products = topRatedProductsResponse.data;

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
    res.status(200).json({ message: 'Collection created successfully', data: collection });
  } catch (error) {
    res.status(500).json({ message: 'Error creating collection', error: error });
  }
};


export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>A short heading about [your app]</h1>
        <p className={styles.text}>
          A tagline about [your app] that describes your value proposition.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
        </ul>
      </div>
    </div>
  );
}
