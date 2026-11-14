import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export async function makeSecret(password: string): Promise<{ salt: string; hash: string }> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  const salt = Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const hash = await hashPassword(password, salt);
  return { salt, hash };
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  let value = `${salt}:${password}`;
  for (let round = 0; round < 8; round += 1) {
    value = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
  }
  return value;
}

export function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

export async function saveSecret(userId: string, salt: string, hash: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(`levelup-secret-${userId}`, JSON.stringify({ salt, hash }));
  } catch {
    // Secure storage is unavailable on some web runtimes. The database copy remains.
  }
}

export async function readSecret(userId: string): Promise<{ salt: string; hash: string } | null> {
  try {
    const raw = await SecureStore.getItemAsync(`levelup-secret-${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { salt: string; hash: string };
    if (!parsed.salt || !parsed.hash) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function deleteSecret(userId: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(`levelup-secret-${userId}`);
  } catch {
    // Already gone, or storage is unavailable.
  }
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
