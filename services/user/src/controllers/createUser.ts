import { Request, Response, NextFunction } from "express";
import { UserCreateSchema } from "@/schemas";
import prisma from "@/prisma";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseBody = UserCreateSchema.safeParse(req.body);
    if (!parseBody) {
      return res.status(400).json({ message: parseBody.error.errors });
    }
    // check if the authUserId already exists
    const existingUser = await prisma.user.findUnique({
      where: { authUserId: parseBody.data.authUserId },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Create a new user
    const user = await prisma.user.create({
      data: {
        authUserId: parseBody.data.authUserId,
        name: parseBody.data.name,
        email: parseBody.data.email,
        address: parseBody.data.address,
        phone: parseBody.data.phone,
      },
    });
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export default createUser;
