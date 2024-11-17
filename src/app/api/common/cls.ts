import { TokenContent } from '@/app/api/common/auth/jwt'
import * as cls from 'continuation-local-storage'

const NAMESPACE_NAME = 'auth-session'
const session = cls.createNamespace(NAMESPACE_NAME)

const getNamespace = () => {
  return session
}

const setUser = (decoded: TokenContent) => {
  return getNamespace().set('user', decoded)
}

const getUser = () => {
  return get('user') as TokenContent
}

const set = (key: string, value: any) => {
  return getNamespace().set(key, value)
}

const get = (key: string) => {
  return getNamespace().get(key)
}

const clsModule = {
  getNamespace,
  setUser,
  getUser,
  set,
  get,
}

export default clsModule
