import { Tabs, TextInput, Select, Group, Button, Badge } from '@mantine/core'
import React, { Dispatch, useState } from 'react'
import { IconSearch } from '@tabler/icons-react'

type IProps = {
  draftOrders: React.ReactNode
  confirmedOrders: React.ReactNode
  cancelledOrders: React.ReactNode
  draftQty: number
  confirmedQty: number
  cancelledQty: number
  applyFilters: Dispatch<any>
}

const OrdersTabs = ({
  draftOrders,
  confirmedOrders,
  cancelledOrders,
  draftQty,
  confirmedQty,
  cancelledQty,
  applyFilters,
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
    <Tabs defaultValue="draft">
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

      <Tabs.Panel value="draft">{draftOrders}</Tabs.Panel>
      <Tabs.Panel value="confirmed">{confirmedOrders}</Tabs.Panel>
      <Tabs.Panel value="cancelled">{cancelledOrders}</Tabs.Panel>
    </Tabs>
  )
}
export default OrdersTabs
