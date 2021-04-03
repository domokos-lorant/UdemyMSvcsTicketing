import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string, salt?: string): Promise<string> {
    if (!salt) {
      salt = randomBytes(8).toString("hex");
    }

    const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buffer.toString("hex")}.${salt}`;
  }

  static async compare(
    storedPassword: string,
    suppliedPassword: string
  ): Promise<boolean> {
    const salt = storedPassword.split(".")[1];
    const hashedPassword = await this.toHash(suppliedPassword, salt);

    return storedPassword === hashedPassword;
  }
}
