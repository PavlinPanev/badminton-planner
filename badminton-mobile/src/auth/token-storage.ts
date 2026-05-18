import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

function canUseLocalStorage() {
  return typeof globalThis.localStorage !== 'undefined';
}

async function getNativeItem(key: string) {
  const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
  return isAvailable ? SecureStore.getItemAsync(key) : null;
}

async function setNativeItem(key: string, value: string) {
  const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);

  if (isAvailable) {
    await SecureStore.setItemAsync(key, value);
  }
}

async function deleteNativeItem(key: string) {
  const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);

  if (isAvailable) {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function getStoredAuthValue(key: string) {
  if (Platform.OS === 'web') {
    return canUseLocalStorage() ? globalThis.localStorage.getItem(key) : null;
  }

  return getNativeItem(key);
}

export async function setStoredAuthValue(key: string, value: string) {
  if (Platform.OS === 'web') {
    if (canUseLocalStorage()) {
      globalThis.localStorage.setItem(key, value);
    }
    return;
  }

  await setNativeItem(key, value);
}

export async function deleteStoredAuthValue(key: string) {
  if (Platform.OS === 'web') {
    if (canUseLocalStorage()) {
      globalThis.localStorage.removeItem(key);
    }
    return;
  }

  await deleteNativeItem(key);
}
