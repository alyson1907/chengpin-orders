import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'
import EditableCategory from '@/app/components/dashboard/EditableCategory'
import { handleResponseError, showErrorToast } from '@/app/helpers/handle-request-error'
import { ActionIcon, Group, Stack, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPencil } from '@tabler/icons-react'
import { uniqueId } from 'lodash'
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

  if (isLoading) return <DefaultLoadingOverlay />
  if (error) showErrorToast('Problema ao carregar categorias', 'Por favor, verifique a conexão')

  return (
    <Stack p="sm">
      <Group justify="space-between">
        <Title order={5}>Categorias</Title>
        <ActionIcon variant="transparent" color="indigo" onClick={toggle}>
          <IconPencil size={22} />
        </ActionIcon>
      </Group>
      {data?.entries.map((category) => {
        return (
          <EditableCategory
            key={uniqueId()}
            category={category}
            isEditable={isEditEnabled}
            onUpdate={() => {
              mutate()
            }}
          />
        )
      })}
    </Stack>
  )
}

export default DashboardNavbar
