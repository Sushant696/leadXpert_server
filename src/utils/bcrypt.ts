import bcrypt from "bcryptjs";

/**
 * Password hashing helpers around bcryptjs.
 *
 * - `generate(password, rounds)` → salted hash string
 * - `compare(password, hash)`    → boolean match
 */
export const bcryptUtil = {
  async generate(password: string, saltRounds: number = 12): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  },

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};

export default bcryptUtil;
