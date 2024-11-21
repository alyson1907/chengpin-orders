import { Tabs, TextInput, Select, Button, Menu, Group } from '@mantine/core'
import React, { useEffect, useState } from 'react'
import { IconSearch, IconFilter } from '@tabler/icons-react'

type IProps = {
  draftOrders: React.ReactNode
  confirmedOrders: React.ReactNode
  cancelledOrders: React.ReactNode
}

const OrdersTabs = ({ draftOrders, confirmedOrders, cancelledOrders }: IProps) => {
  const [filter, setFilter] = useState({ search: '', orderBy: '', orderDirection: '' })

  const handleFilterChange = (field: string, value: string) => {
    setFilter((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    console.log(filter)
  }, [filter])

  return (
    <Tabs defaultValue="draft">
      <Tabs.List justify="center">
        <Tabs.Tab value="draft">Pendentes</Tabs.Tab>
        <Tabs.Tab value="confirmed">Confimadas</Tabs.Tab>
        <Tabs.Tab value="cancelled">Canceladas</Tabs.Tab>
      </Tabs.List>

      <Group my="md">
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Search by customer key or name"
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <Menu>
          <Menu.Target>
            <Button leftSection={<IconFilter size={16} />}>Filter</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Sort by</Menu.Label>
            <Select
              placeholder="Select field"
              data={[
                { value: 'deliveryDate', label: 'Delivery Date' },
                { value: 'commercialDate', label: 'Commercial Date' },
                { value: 'createdAt', label: 'Created At' },
              ]}
              onChange={(value) => handleFilterChange('orderBy', value || '')}
            />
            <Select
              placeholder="Select order"
              data={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              onChange={(value) => handleFilterChange('orderDirection', value || '')}
            />
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Tabs.Panel value="draft">{draftOrders}</Tabs.Panel>
      <Tabs.Panel value="confirmed">{confirmedOrders}</Tabs.Panel>
      <Tabs.Panel value="cancelled">{cancelledOrders}</Tabs.Panel>
    </Tabs>
  )
}
export default OrdersTabs
