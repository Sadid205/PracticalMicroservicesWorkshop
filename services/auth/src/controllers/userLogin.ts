import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "@/prisma";
import { UserLoginSchema } from "@/schemas";
import bcrypt from "bcryptjs";

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ipAddress = req.headers["x-forwarded-for"] || req.ip || "";
    const userAgent = req.header["user-agent"] || "";
    // validate the request body
    const parsedBody = UserLoginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }
    // check if the user exists
    const user = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // compare password
    const isMatch = await bcrypt.compare(
      parsedBody.data.password,
      user.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // check if the user is verified
    if (!user.varified) {
      return res.status(400).json({ message: "User not verified" });
    }
    // check if the account is active
    if (user.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: `Your account ${user.status.toLocaleLowerCase()}` });
    }
    // generate access token
    const accessToken = jwt.sign(
      { usreId: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET ?? "My_Secret_Key",
      { expiresIn: "2h" }
    );
    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export default userLogin;
