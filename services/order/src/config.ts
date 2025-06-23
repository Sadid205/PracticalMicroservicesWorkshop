import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

export const CART_SERVICE = process.env.CART_SERVICE_URL || "http://cart:4006";
export const EMAIL_SERVICE =
  process.env.EMAIL_SERVICE_URL || "http://email:4005";
export const PRODUCT_SERVICE =
  process.env.PRODUCT_SERVICE_URL || "http://product:4001";
export const QUEUE_URL = process.env.QEUE_URL || "amqp://rabbitmq";
