import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface Payload {
  id: any;
  email: string;
}

function GenerateTokens(payloadData: Payload) {
  const payload = {
    id: payloadData.id,
    email: payloadData.email,
  };

  const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
}

export default GenerateTokens;

