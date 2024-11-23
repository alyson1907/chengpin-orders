import { handleResponseError } from '@/app/helpers/handle-request-error'
import { isNotValid } from '@/app/helpers/validate-helper'
import { Button, Group, Modal, ModalProps, Switch, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { useState } from 'react'
import { z } from 'zod'

type IProps = {
  afterCreate: () => void
} & ModalProps

const NewCategoryModal = ({ afterCreate = () => {}, ...props }: IProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm({
    initialValues: {
      name: '',
      visible: true,
    },
    validate: {
      name: (value) => isNotValid(value, z.string().min(1)) && 'Campo obrigatório',
    },
    transformValues: (values) => ({ name: values.name.trim(), visible: values.visible }),
  })

  const createCategoryRequest = async (name: string, visible: boolean) => {
    setIsLoading(true)
    const body = {
      name,
      visible,
    }
    const res = await fetch('/api/category', { method: 'POST', body: JSON.stringify(body) })
    const resBody = await res.json()
    handleResponseError(resBody)
    setIsLoading(false)
  }

  return (
    <Modal {...props} title="Nova Categoria" centered>
      <form
        id="create-new-category-form"
        onSubmit={async (e) => {
          e.preventDefault()
          const values = form.getTransformedValues()
          await createCategoryRequest(values.name, values.visible)
          afterCreate()
        }}
      >
        <TextInput
          form="create-new-category-form"
          label="Nome"
          placeholder="Orquídeas Pimposas de Plástico..."
          value={form.values.name}
          {...form.getInputProps('name')}
        />
        <Group mt="lg" justify="flex-end">
          <Switch label="Ativa?" {...form.getInputProps('visible')} checked={form.getValues().visible} />
          <Button loading={isLoading} leftSection={<IconDeviceFloppy />} form="create-new-category-form" type="submit">
            Salvar
          </Button>
        </Group>
      </form>
    </Modal>
  )
}

export default NewCategoryModal
