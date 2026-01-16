import ms from "ms";
import { env } from "../config/env";

const cookieConfig = {
  accessTokenConfig: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: ms(env.ACCESS_TOKEN_EXPIRY),
  },
  refreshTokenConfig: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: ms(env.REFRESH_TOKEN_EXPIRY),
  },
};

export default cookieConfig;

