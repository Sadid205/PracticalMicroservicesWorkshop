import { z } from "zod";
import { Request, Response, NextFunction } from "express";
export const UserCreateSchema = z.object({
  authUserId: z.string(),
  name: z.string(),
  email: z.string().email(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const UserUpdateSchema = UserCreateSchema.omit({
  authUserId: true,
}).partial();
