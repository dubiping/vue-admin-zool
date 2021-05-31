import { storage, tokenKey } from '@/config'

export function getToken() {
  if (storage === 'sessionStorage') {
    return sessionStorage.getItem(tokenKey)
  }
  return localStorage.getItem(tokenKey)
}

export function setToken(token) {
  if (storage === 'sessionStorage') {
    return sessionStorage.setItem(tokenKey, token)
  }
  return localStorage.setItem(tokenKey, token)
}

export function removeToken() {
  if (storage === 'sessionStorage') {
    return sessionStorage.clear()
  }
  localStorage.removeItem(tokenKey)
}
