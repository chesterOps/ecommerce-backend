import jwt, { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

interface tokenPayload extends JwtPayload {
  id: string;
  role: string;
}

// Sign token
export const signToken = (data: { id: string; role: string }) => {
  return jwt.sign(data, process.env.JWT_SECRET || "", {
    expiresIn: "24h",
  });
};

// Fetch token
export const fetchToken = (req: Request) => {
  // Authorization
  const authorization = req.headers.authorization;

  // Cookie
  const cookie = req.cookies.token;

  // Check for token in authorization header
  if (authorization && authorization.startsWith("Bearer"))
    return authorization.split(" ")[1];

  // Check for token in cookie
  if (cookie && cookie !== "no-value") return cookie;
};

// Verify token
export const verifyToken = async (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET || "") as tokenPayload;
