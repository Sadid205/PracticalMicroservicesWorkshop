import prisma from "@/prisma";
import axios from "axios";
import { NextFunction, Request, response, Response } from "express";
import { ProductCreateDTOSchema } from "@/schemas";
import { INVENTORY_URL } from "@/config";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validated request body
    const parseBody = ProductCreateDTOSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parseBody.error.errors,
      });
    }
    // check if product with same sku already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku: parseBody.data.sku,
      },
    });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Product with same SKU already exists" });
    }

    // Crate product
    const { sku, name, description, price, status } = parseBody.data;
    const product = await prisma.product.create({
      data: {
        sku: sku,
        name: name,
        description: description,
        price: price,
        status: status,
      },
    });
    console.log("Product created successfully", product.id);

    const { data: inventory } = await axios.post(
      `${INVENTORY_URL}/inventories`,
      {
        productId: product.id,
        sku: product.sku,
      }
    );
    console.log("Inventory created successfully", inventory.id);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        inventoryId: inventory.id,
      },
    });
    console.log("Product updated successfully with inventory id", inventory.id);

    res.status(201).json({ ...product, inventoryId: inventory.id });
  } catch (err) {
    next(err);
  }
};

export default createProduct;
