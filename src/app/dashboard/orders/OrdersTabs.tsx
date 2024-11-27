import { Badge, Button, Group, Pagination, Select, Tabs, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import React, { Dispatch, useState } from 'react'

type IProps = {
  activeTab: string | null
  setActiveTab: Dispatch<string | null>
  draftOrders: React.ReactNode
  confirmedOrders: React.ReactNode
  cancelledOrders: React.ReactNode
  draftQty: number
  confirmedQty: number
  cancelledQty: number
  draftTotal: number
  confirmedTotal: number
  cancelledTotal: number
  draftPage: number
  confirmedPage: number
  cancelledPage: number
  perPage: number
  draftOnPageChange: (page: number) => void
  confirmedOnPageChange: (page: number) => void
  cancelledOnPageChange: (page: number) => void

  applyFilters: Dispatch<any>
}

const OrdersTabs = ({
  activeTab = 'draft',
  setActiveTab = () => {},
  draftOrders,
  confirmedOrders,
  cancelledOrders,
  draftQty,
  confirmedQty,
  cancelledQty,
  applyFilters,
  draftTotal = 0,
  confirmedTotal = 0,
  cancelledTotal = 0,
  draftPage = 1,
  confirmedPage = 1,
  cancelledPage = 1,
  perPage = 20,
  draftOnPageChange = () => {},
  confirmedOnPageChange = () => {},
  cancelledOnPageChange = () => {},
}: IProps) => {
  const [filter, setFilter] = useState({
    searchCustomerKey: '',
    searchCustomerName: '',
    orderBy: '',
    orderDirection: '',
  })

  const handleFilterChange = (field: string, value: string) => {
    setFilter((prev) => ({ ...prev, [field]: value }))
  }

  const renderFilter = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        applyFilters(filter)
      }}
    >
      <Group my="md">
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Chave do comprador"
          onChange={(e) => handleFilterChange('searchCustomerKey', e.target.value)}
        />
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Nome do comprador"
          onChange={(e) => handleFilterChange('searchCustomerName', e.target.value)}
        />
        <Select
          placeholder="Campo"
          value={filter.orderBy}
          data={[
            { value: 'deliveryDate', label: 'Data de Entrega' },
            { value: 'commercialDate', label: 'Data comercial' },
            { value: 'createdAt', label: 'Realizado em' },
          ]}
          onChange={(value) => handleFilterChange('orderBy', value || '')}
          clearable
        />
        <Select
          placeholder="Ordem"
          value={filter.orderDirection}
          data={[
            { value: 'asc', label: 'Crescente' },
            { value: 'desc', label: 'Decrescente' },
          ]}
          onChange={(value) => handleFilterChange('orderDirection', value || '')}
          clearable
        />
        <Button type="submit">
          <IconSearch />
        </Button>
      </Group>
    </form>
  )

  return (
    <Tabs defaultValue="draft" value={activeTab} onChange={setActiveTab}>
      <Tabs.List justify="center">
        <Tabs.Tab value="draft">
          Pendentes <Badge variant="transparent">{draftQty}</Badge>
        </Tabs.Tab>
        <Tabs.Tab value="confirmed">
          Confimadas <Badge variant="transparent">{confirmedQty}</Badge>
        </Tabs.Tab>
        <Tabs.Tab value="cancelled">
          Canceladas <Badge variant="transparent">{cancelledQty}</Badge>
        </Tabs.Tab>
      </Tabs.List>

      {renderFilter()}

      <Tabs.Panel value="draft">
        {draftOrders}
        <Group justify="center">
          <Pagination mt="md" total={Math.ceil(draftTotal / perPage)} value={draftPage} onChange={draftOnPageChange} />
        </Group>
      </Tabs.Panel>
      <Tabs.Panel value="confirmed">
        {confirmedOrders}
        <Group justify="center">
          <Pagination
            mt="md"
            total={Math.ceil(confirmedTotal / perPage)}
            value={confirmedPage}
            onChange={confirmedOnPageChange}
          />
        </Group>
      </Tabs.Panel>
      <Tabs.Panel value="cancelled">
        {cancelledOrders}
        <Group justify="center">
          <Pagination
            mt="md"
            total={Math.ceil(cancelledTotal / perPage)}
            value={cancelledPage}
            onChange={cancelledOnPageChange}
          />
        </Group>
      </Tabs.Panel>
    </Tabs>
  )
}
export default OrdersTabs
