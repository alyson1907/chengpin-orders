import { AuthCookieKeys } from '@/app/api/common/enum/auth-cookie-keys.enum'
import { handleResponseError } from '@/app/helpers/handle-request-error'
import Cookies from 'js-cookie'
import { redirect } from 'next/navigation'

export const login = async (username: string, password: string) => {
  const loginResponse = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
    }),
  })
  const loginBody = await loginResponse.json()
  const isError = handleResponseError(loginBody)
  if (isError) return true
  await setUserCookie()
  return false
}

const setUserCookie = async (authRedirectUrl?: string) => {
  const response = await fetch('/api/auth/me')
  const responseBody = await response.json()
  // If no token, invalid/expired token
  const isError = handleResponseError(responseBody, authRedirectUrl)
  if (isError) return
  const newUser = responseBody.data
  if (newUser) Cookies.set(AuthCookieKeys.USER, JSON.stringify(newUser))
  return newUser
}

export const checkAuth = async (authRedirectUrl?: string) => {
  const user = Cookies.get(AuthCookieKeys.USER)
  if (user) return JSON.parse(user)
  return setUserCookie(authRedirectUrl)
}

export const redirectLogin = (authRedirectUrl?: string) => {
  const base = '/auth/login'
  const url = authRedirectUrl ? base + `?redirect_url=${authRedirectUrl}` : base
  redirect(url)
}
