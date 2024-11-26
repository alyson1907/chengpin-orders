import { DefaultLoadingOverlay } from '@/app/common/DefaultLoadingOverlay'
import DropzoneImage from '@/app/common/DropzoneImage'
import SelectThumb from '@/app/common/SelectThumb'
import { handleResponseError, showErrorToast } from '@/app/helpers/handle-request-error'
import { isNotValid } from '@/app/helpers/validate-helper'
import { Box, Button, Center, Group, Modal, ModalProps, Select, Text, TextInput, Textarea } from '@mantine/core'
import { FileWithPath } from '@mantine/dropzone'
import { useForm } from '@mantine/form'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { z } from 'zod'

type IProps = {
  product?: any
  onSave: (body: any) => Promise<void>
} & ModalProps

const emptyProduct = {
  name: '',
  description: '',
  coverImg: '',
  categoryProduct: [],
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const resBody = await res.json()
  handleResponseError(resBody)
  return resBody.data
}
const uploadImages = async (formData: FormData) => {
  const res = await fetch('/api/image', { method: 'POST', body: formData })
  const resBody = await res.json()
  handleResponseError(resBody)
  const imgUrls = resBody.data?.links
  return imgUrls as string[]
}

const CreateProductModal = ({ product = emptyProduct, onSave = async () => {}, ...props }: IProps) => {
  const { data: categories, error, isLoading } = useSWR('/api/category', fetcher)
  const isCreateProduct = product === emptyProduct
  const [isLoadingDropzone, setIsLoadingDropzone] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const form = useForm({
    initialValues: {
      coverImg: product.coverImg,
      name: product.name,
      description: product.description,
      categoryId: product?.categoryProduct[0]?.category.id,
    },
    validate: {
      name: (value) => isNotValid(value, z.string().min(1)) && 'Nome é obrigatório',
      description: (value) => isNotValid(value, z.string().min(1)) && 'Descrição é obrigatório',
      categoryId: (value) => isNotValid(value, z.string().min(1)) && 'Categoria é obrigatória',
    },
    transformValues: (values) => ({
      name: values.name.trim(),
      description: values.description.trim(),
      coverImg: values.coverImg,
      categoryId: values.categoryId,
    }),
  })

  useEffect(() => {
    if (product.imgs) setImages(product.imgs)
  }, [product.imgs])

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

  const handleSubmit = async (
    values: { name: any; description: any; coverImg: any; categoryId: string },
    event?: React.FormEvent<HTMLFormElement>
  ) => {
    event?.preventDefault()
    const { coverImg, name, description, categoryId } = values
    const body = {
      name,
      description,
      coverImg,
      imgs: images,
      categories: [
        {
          id: categoryId,
        },
      ],
    }
    setIsSaving(true)
    await onSave(body)
    setIsSaving(false)
  }

  if (isLoading) return <DefaultLoadingOverlay />
  if (error) {
    showErrorToast('Problema ao carregar categorias', 'Verifique a conexão')
  }

  return (
    <Modal title={isCreateProduct ? 'Novo Produto' : 'Alterar Produto'} size="lg" centered {...props}>
      <DefaultLoadingOverlay visible={isSaving} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
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
              if (!!form.getValues().coverImg) form.setFieldValue('coverImg', images[0])
              setIsLoadingDropzone(false)
            }}
          />
        </Center>

        <Text mt="lg">Imagem de capa</Text>
        <Text size="xs" c="dimmed">
          (As demais imagens também serão exibidas no catálogo)
        </Text>
        <SelectThumb
          mt="md"
          justify="flex-start"
          imageUrls={images}
          selectedIdx={selectedIdx}
          onThumbSelect={selectImgThumbnail}
          onThumbRemove={removeImgThumbnail}
        />
        <Box>
          <Group align="center" mt="md" grow>
            <TextInput label="Nome" placeholder="Enter product name" withAsterisk {...form.getInputProps('name')} />
            <Select
              {...form.getInputProps('categoryId')}
              label="Categoria"
              placeholder="Categoria..."
              data={categories?.entries.map(({ id, name }) => ({ value: id, label: name }))}
              nothingFoundMessage="Não encontrado..."
              onChange={(value) => form.setFieldValue('categoryId', value || '')}
              searchable
              withAsterisk
            />
          </Group>
          <Textarea
            mt="sm"
            label="Descrição"
            placeholder="A Orquídea Pimposa é originária dos..."
            {...form.getInputProps('description')}
            minRows={3}
            autosize
          />
          <Button mt="lg" type="submit" loading={isSaving} fullWidth>
            Salvar
          </Button>
        </Box>
      </form>
    </Modal>
  )
}

export default CreateProductModal
