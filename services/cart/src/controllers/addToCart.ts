import { CART_TTL, INVENTORY_SERVICE } from "@/config";
import redis from "@/redis";
import { CartItemSchema } from "@/schemas";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  // validate request body
  const parseBody = CartItemSchema.safeParse(req.body);
  if (!parseBody.success) {
    return res.status(400).json({ errors: parseBody.error.errors });
  }

  let cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

  // check if cart session id is present in the request header and exists in the store
  if (cartSessionId) {
    const exists = await redis.exists(`sessions:${cartSessionId}`);
    console.log("Sessoin Exists", exists);
    if (!exists) {
      cartSessionId = null;
    }
  }
  if (!cartSessionId) {
    cartSessionId = uuid();
    console.log("New Session ID: ", cartSessionId);

    // set the cart session id in the redis store
    await redis.setex(`sessions:${cartSessionId}`, CART_TTL, cartSessionId);

    // set the cart session id in the response header header
    res.setHeader("x-cart-session-id", cartSessionId);
  }

  // check if the inventory is available
  const { data } = await axios.get(
    `${INVENTORY_SERVICE}/inventories/${parseBody.data.inventoryId}`
  );
  if (Number(data.quantity) < parseBody.data.quantity) {
    return res.status(400).json({ message: "Inventory not available" });
  }
  // add item to the cart
  // TODO: Check if the product already in the cart
  // Logic:parseBody.data.quantity - existingQuantity
  await redis.hset(
    `cart:${cartSessionId}`,
    parseBody.data.productId,
    JSON.stringify({
      inventoryId: parseBody.data.inventoryId,
      quantity: parseBody.data.quantity,
    })
  );
  // update inventories
  await axios.put(
    `${INVENTORY_SERVICE}/inventories/${parseBody.data.inventoryId}`,
    {
      quantity: parseBody.data.quantity,
      actionType: "OUT",
    }
  );
  return res.status(200).json({ message: "Item add to cart", cartSessionId });
  // TODO: check inventory for availablity
  // TODO: update the inventory
};

export default addToCart;
