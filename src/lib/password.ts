import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
export const MAX_PASSWORD_LENGTH = 128;

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length > MAX_PASSWORD_LENGTH) {
    throw new Error("Invalid password length");
  }
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (!password || password.length > MAX_PASSWORD_LENGTH) {
    return false;
  }
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== KEY_LENGTH) return false;
  const derivedBuffer = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  if (keyBuffer.length !== derivedBuffer.length) return false;
  return timingSafeEqual(keyBuffer, derivedBuffer);
}


