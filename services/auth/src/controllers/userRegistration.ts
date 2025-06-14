import { Response, Request, NextFunction } from "express";
import prisma from "@/prisma";
import { UserCreateSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import axios from "axios";
import { USER_SERVICE } from "@/config";

const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validated the request body
    const parseBody = UserCreateSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ errors: parseBody.error.errors });
    }
    // check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parseBody.data.password, salt);

    // create the auth user
    const user = await prisma.user.create({
      data: {
        email: parseBody.data.email,
        name: parseBody.data.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        varified: true,
      },
    });
    console.log("User created:", user);
    // create the user profile by calling the user service
    await axios.post(`${USER_SERVICE}/users`, {
      authUserId: user.id,
      name: user.name,
      email: user.email,
    });
    // TODO generate verification code
    // TODO send verification email
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export default userRegistration;
