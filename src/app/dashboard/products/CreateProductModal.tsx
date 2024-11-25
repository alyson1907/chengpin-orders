import DropzoneImage from '@/app/common/DropzoneImage'
import SelectThumb from '@/app/common/SelectThumb'
import { handleResponseError } from '@/app/helpers/handle-request-error'
import { isNotValid } from '@/app/helpers/validate-helper'
import { Box, Button, Center, Modal, ModalProps, Text, TextInput, Textarea } from '@mantine/core'
import { FileWithPath } from '@mantine/dropzone'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { z } from 'zod'

type IProps = {
  product?: any
  close: () => void
} & ModalProps

const emptyProduct = {
  name: '',
  description: '',
  coverImg: '',
}

const uploadImages = async (formData: FormData) => {
  const res = await fetch('/api/image', { method: 'POST', body: formData })
  const resBody = await res.json()
  handleResponseError(resBody)
  const imgUrls = resBody.data?.links
  return imgUrls as string[]
}

const CreateProductModal = ({ product = emptyProduct, close = () => {}, ...props }: IProps) => {
  const isCreateProduct = product === emptyProduct
  const [isLoadingDropzone, setIsLoadingDropzone] = useState(false)
  const [images, setImages] = useState<string[]>([...product.imgs])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const form = useForm({
    initialValues: {
      coverImg: product.coverImg,
      name: product.name,
      description: product.description,
      categoryId: '',
    },
    validate: {
      name: (value) => isNotValid(value, z.string().min(1)) && 'Nome é obrigatório',
      description: (value) => isNotValid(value, z.string().min(1)) && 'Descrição é obrigatório',
      categoryId: (value) => isNotValid(value, z.string().min(1)) && 'Categoria é obrigatório',
    },
    transformValues: (values) => ({
      name: values.name.trim(),
      description: values.description.trim(),
      coverImg: values.coverImg,
      categoryId: values.categoryId,
    }),
  })

  const selectImgThumbnail = (idx: number) => {
    setSelectedIdx(idx)
    form.setFieldValue('coverImg', images[idx])
  }

  const removeImgThumbnail = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx))
    if (idx < selectedIdx) setSelectedIdx(selectedIdx - 1)
    if (selectedIdx === idx) {
      setSelectedIdx(0)
      form.setFieldValue('coverImg', images[0])
    }
  }

  return (
    <Modal title={isCreateProduct ? 'Novo Produto' : 'Alterar Produto'} size="lg" centered {...props}>
      <Center>
        <DropzoneImage
          maw={'75%'}
          loading={isLoadingDropzone}
          onDrop={async (files: FileWithPath[]) => {
            setIsLoadingDropzone(true)
            const formData = new FormData()
            files.forEach((file) => formData.append('file', file))
            const imgUrls = await uploadImages(formData)
            setImages([...images, ...imgUrls])
            setIsLoadingDropzone(false)
          }}
        />
      </Center>
      <form
        onSubmit={form.onSubmit((values) => {
          const { coverImg, name, description, categoryId } = values
          const body = {
            name,
            description,
            coverImg,
            imgs: images,
            // availability: [
            //   {
            //     name: "Pote {{$randomInt}}",
            //     price: {{$randomInt}},
            //     qty: 99999
            //   },
            // ],
            categories: [
              {
                id: categoryId,
              },
            ],
          }
          console.log(body)
          close()
        })}
      >
        <Text mt="lg">Selecione a imagem de capa:</Text>
        <Text size="xs" c="dimmed">
          (As demais imagens também serão exibidas no catálogo)
        </Text>
        <SelectThumb
          justify="flex-start"
          imageUrls={images}
          selectedIdx={selectedIdx}
          onThumbSelect={selectImgThumbnail}
          onThumbRemove={removeImgThumbnail}
        />
        <Box>
          <TextInput label="Name" placeholder="Enter product name" withAsterisk {...form.getInputProps('name')} />
          <Textarea
            mt="sm"
            label="Descrição"
            placeholder="A Orquídea Pimposa é originária dos..."
            {...form.getInputProps('description')}
            minRows={3}
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
