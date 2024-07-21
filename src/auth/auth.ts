import * as vscode from "vscode";
import * as crypto from "crypto";
import CryptoJS from "crypto-js";
import { SpotifyPlayerViewProvider } from "../panel";
import axios from "axios";

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

export const getToken = async (code: string, clientId: string, redirectUri: string, provider: SpotifyPlayerViewProvider, memento: vscode.Memento) => {
    let codeVerifier = memento.get("code_verifier") as string;

    const payload = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });

    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    };

    const res = await axios.post("https://accounts.spotify.com/api/token", payload, config);

    if (res.status === 200) {
        memento.update("access_token", res.data.access_token);
        return true;
    }

    // TODO
    // provider.isLoggedIn();

    return false;
};
