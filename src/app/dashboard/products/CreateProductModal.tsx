import { isNotValid } from '@/app/helpers/validate-helper'
import { Box, Button, Modal, ModalProps, TextInput, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { z } from 'zod'

type IProps = {
  product?: any
  isCreateProduct: boolean
  close: () => void
} & ModalProps

const emptyProduct = {
  name: '',
  description: '',
  coverImg: '',
}

const CreateProductModal = ({
  product = emptyProduct,
  isCreateProduct = false,
  close = () => {},
  ...props
}: IProps) => {
  const form = useForm({
    initialValues: {
      name: product.name,
      description: product.description,
      coverImg: product.coverImg,
    },
    validate: {
      name: (value) => isNotValid(value, z.string().min(1)) && 'Nome é obrigatório',
      description: (value) => isNotValid(value, z.string().min(1)) && 'Descrição é obrigatório',
    },
    transformValues: (values) => ({
      name: values.name.trim(),
      description: values.description.trim(),
    }),
  })

  return (
    <Modal title={isCreateProduct ? 'Novo Produto' : 'Alterar Produto'} size="lg" centered {...props}>
      <form
        onSubmit={form.onSubmit((values) => {
          console.log(values) // Replace with update logic
          close()
        })}
      >
        <Box>
          <TextInput label="URL da Image de Capa" placeholder="Enter image URL" {...form.getInputProps('coverImg')} />
          <TextInput mt="sm" label="Name" placeholder="Enter product name" {...form.getInputProps('name')} />
          <Textarea
            mt="sm"
            label="Descrição"
            placeholder="A Orquídea Pimposa é originária dos..."
            {...form.getInputProps('description')}
            autosize
          />
          <Button type="submit" fullWidth mt="md">
            Save Changes
          </Button>
        </Box>
      </form>
    </Modal>
  )
}

export default CreateProductModal
