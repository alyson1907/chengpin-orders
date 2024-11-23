import { DefaultLoadingOverlay } from '@/app/common/DefaultLoadingOverlay'
import EditableCategory from '@/app/dashboard/components/EditableCategory'
import NewCategoryModal from '@/app/dashboard/components/NewCategoryModal'
import { handleResponseError, showErrorToast } from '@/app/helpers/handle-request-error'
import { ActionIcon, Group, Stack, Title, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPencil, IconPencilOff, IconPlus } from '@tabler/icons-react'
import useSWR from 'swr'

type TData = {
  entries: any[]
  total: number
  totalFiltered: number
}

const fetcher = async (url: string) => {
  const qs = new URLSearchParams({
    orderBy__desc: 'visible',
  })
  const res = await fetch(`${url}?${qs}`)
  const body = await res.json()
  handleResponseError(body)
  return body.data
}

const DashboardNavbar = () => {
  const { data, error, isLoading, mutate } = useSWR<TData>('/api/category', fetcher)
  const [isEditEnabled, { toggle }] = useDisclosure(false)
  const [isNewCategoryOpen, { open: openNewCategory, close: closeNewCategory }] = useDisclosure(false)

  if (isLoading) return <DefaultLoadingOverlay />
  if (error) showErrorToast('Problema ao carregar categorias', 'Por favor, verifique a conexão')

  return (
    <Stack p="sm">
      <Group justify="space-between">
        <Title order={5}>Categorias</Title>
        <Group>
          <NewCategoryModal
            opened={isNewCategoryOpen}
            onClose={closeNewCategory}
            afterCreate={() => {
              mutate()
              closeNewCategory()
            }}
          />
          <Tooltip label="Criar Categoria">
            <ActionIcon variant="transparent" color="indigo" onClick={openNewCategory}>
              <IconPlus size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar Categorias">
            <ActionIcon variant="transparent" color="indigo" onClick={toggle}>
              {isEditEnabled ? <IconPencilOff size={18} /> : <IconPencil size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      {data?.entries.map((category) => {
        return (
          <EditableCategory
            key={category.id}
            category={category}
            isEditable={isEditEnabled}
            afterUpdate={() => {
              mutate()
            }}
          />
        )
      })}
    </Stack>
  )
}

export default DashboardNavbar
