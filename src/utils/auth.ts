import * as crypto from "crypto";
import CryptoJS from "crypto-js";

export const generateRandomString = (length: number): string => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

export const sha256 = (plain: string): string => {
    return CryptoJS.SHA256(plain).toString(CryptoJS.enc.Base64url);
};

export const base64encode = (input: string): string => {
    return input.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};
