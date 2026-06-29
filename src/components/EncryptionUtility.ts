/**
 * Client-Side End-to-End Encryption Utility
 * Securely encrypts workspace data using AES-GCM via browser Web Crypto API
 */

// Generate a cryptographic key from a password and salt using PBKDF2
async function getKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a JSON object into a secure base64 payload
 */
export async function encryptData(data: any, keyString: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(JSON.stringify(data));
    
    // Generate a random 16-byte salt and 12-byte IV
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const key = await getKey(keyString, salt);
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      dataBytes
    );
    
    // Combine salt, iv, and ciphertext into a single buffer
    const resultBuffer = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
    resultBuffer.set(salt, 0);
    resultBuffer.set(iv, salt.byteLength);
    resultBuffer.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);
    
    // Convert to binary string then base64
    let binary = "";
    const len = resultBuffer.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(resultBuffer[i]);
    }
    return window.btoa(binary);
  } catch (err) {
    console.error("Encryption error:", err);
    throw new Error("End-to-End Encryption failed. Check your security key.");
  }
}

/**
 * Decrypts a secure base64 payload back into a JSON object
 */
export async function decryptData(encryptedBase64: string, keyString: string): Promise<any> {
  try {
    // Convert base64 to Uint8Array
    const binary = window.atob(encryptedBase64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    // Extract salt, iv, and ciphertext
    const salt = bytes.slice(0, 16);
    const iv = bytes.slice(16, 28);
    const ciphertext = bytes.slice(28);
    
    const key = await getKey(keyString, salt);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  } catch (err) {
    console.error("Decryption error:", err);
    throw new Error("Decryption failed. Invalid security key or corrupted backup.");
  }
}
