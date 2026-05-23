import { Resend } from "resend";

import { env } from "../../config/env";

const resend = new Resend(env.RESEND_API_KEY);

export { resend };