import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { notifications } from '@mantine/notifications'
import { IconExclamationMark } from '@tabler/icons-react'

type TDisplayMessage = {
  title: string
  message: string
}
const getDisplayMessage = (errorKey: ErrorKey): TDisplayMessage => {
  const defaultDisplayMessage = {
    title: 'Problema inesperado',
    message: 'Ocorreu um problema inesperado. Por favor tente novamente mais tarde',
  }
  const displayMessages = {
    AUTH_INVALID_TOKEN: {
      title: 'Problema de autenticação',
      message: 'Token de autenticação inválido',
    },
    AUTH_NO_PERMISSION: {
      title: 'Sem permissões',
      message: 'Você não tem permissão para acessar essa página',
    },
    AUTH_INVALID_CREDENTIALS: {
      title: 'Credenciais incorretas',
      message: 'Login ou senha inválidos',
    },
    UNEXPECTED_ERROR: {
      title: 'Problema inesperado',
      message: 'Ocorreu um problema inesperado. Por favor tente novamente mais tarde',
    },
    INVALID_OPERATION_DRAFT_ORDER: {
      title: 'Operação inválida',
      message: 'Operação válida para pedidos em modo rascunho',
    },
    MISSING_ENTITIES: {
      title: 'Não encontrado',
      message: 'O recurso solicitado não foi encontrado',
    },
    DUPLICATED_ENTRY: {
      title: 'Recurso já cadastrado',
      message: 'O recurso já está cadastrado no sistema',
    },
    UNAVAILABLE_RESOURCE: {
      title: 'Recurso indisponível',
      message: 'O recurso acessado não está disponível no momento',
    },
    AMOUNT_LIMIT: {
      title: 'Quantidade não disponível',
      message: 'A quantidade desejada não está mais disponível. Por favor refaça seu pedido',
    },
  }
  return displayMessages[errorKey] || defaultDisplayMessage
}

export const showErrorToast = (title: string, message: string) => {
  console.log(title, message)
  notifications.show({
    title,
    message,
    icon: <IconExclamationMark />,
    color: 'red',
    position: 'bottom-right',
  })
}

export const handleResponseError = (responseBody: any) => {
  const errorKey = responseBody?.errorKey
  const displayMessage = getDisplayMessage(errorKey)
  console.log(displayMessage)
  console.log(displayMessage)
  return showErrorToast(displayMessage.title, displayMessage.message)
}
