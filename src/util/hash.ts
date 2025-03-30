import bcrypt from "bcryptjs";
import conf from "../conf/hash.conf";
import crypto from 'crypto';

export default {
  /**
   *
   * @param hashedPassword Hashed Password from the database
   * @param plainPassword Plain Password sent by the client
   *
   * @returns {Boolean}
   */
  compare: async (plainPassword: string, hashedPassword: string) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },
  /**
   *
   * @param plainPassword
   */
  generate: async (plainPassword: string) => {
    return await bcrypt.hash(plainPassword, conf.saltRounds);
  },

  decrypt: async (encryptedPassword: string) => {
    let decipher = crypto.createDecipheriv('aes-256-cbc', conf.key, conf.iv);
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  },
};