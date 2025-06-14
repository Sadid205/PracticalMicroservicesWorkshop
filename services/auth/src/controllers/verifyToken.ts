import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "@/prisma";
import { AccesstokenSchema } from "@/schemas";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body
  try {
    const parsedBody = AccesstokenSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }
    const { accessToken } = parsedBody.data;
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string);
    const user = await prisma.user.findUnique({
      where: { id: (decoded as any).usreId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ message: "Authorized", user });
  } catch (error) {
    next(error);
  }
};

export default verifyToken;
