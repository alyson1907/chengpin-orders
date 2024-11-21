'use client'
import dayjs from '@/app/api/common/dayjs'
import { OrderStatus } from '@/app/api/order/order-status.enum'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'
import LongPressButton from '@/app/components/common/LongPressButton'
import { handleResponseError } from '@/app/helpers/handle-request-error'
import { useMantineColor } from '@/app/helpers/hooks'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { Badge, Box, Button, Card, Collapse, Group, Stack, Table, Text } from '@mantine/core'
import {
  IconCheck,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconBrandWhatsapp,
  IconClock,
  IconKey,
  IconPencil,
} from '@tabler/icons-react'
import { useState } from 'react'
import useSWR from 'swr'

const fetcher = async (url: string) => {
  const ordersPromise = Object.entries(OrderStatus).map(async ([key, value]) => {
    const qs = new URLSearchParams({
      orderBy__desc: 'createdAt',
      status: value,
    })
    const response = await fetch(`${url}?${qs}`)
    const body = await response.json()
    handleResponseError(body)
    return {
      status: key,
      data: body.data || { entries: [] },
    }
  })

  const orders = await Promise.all(ordersPromise)
  const formattedOrders = orders.reduce((acc, item) => {
    return { ...acc, [item.status]: item.data.entries }
  }, {})

  const result = {
    entries: formattedOrders,
    total: parseInt(orders[0].data?.total) || 0,
  }
  return result
}

const badgeColor = {
  DRAFT: 'orange',
  CONFIRMED: 'matcha',
  CANCELLED: 'grey',
}

const DashboardOrders = () => {
  const { data, error, isLoading } = useSWR('/api/order', fetcher)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [completedOrders, setCompletedOrders] = useState<Array<string>>([])

  const statusIcons = {
    DRAFT: <IconClock size={16} color={useMantineColor('orange')} />,
    CONFIRMED: <IconCheck size={16} color={useMantineColor('matcha')} />,
    CANCELLED: <IconX size={16} color={useMantineColor('gray')} />,
  }

  const toggleOrderItems = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId))
  }

  const renderOrders = (orders: any[]) => {
    if (!orders) return
    return orders.map((order) => {
      const totalPrice = order.orderItems.reduce((total, item) => total + item.price * item.qty, 0)
      const totalDisplay = BRL.format(totalPrice)
      return (
        <Card key={order.id} shadow="md" radius="sm" withBorder>
          <Stack>
            <Group grow>
              <Group justify="space-between">
                <Group>
                  {/* Name */}
                  <Group style={{ gap: 4 }} align="center">
                    <IconKey size={18} />
                    <Text size="sm" fw={600}>
                      {order.customerKey} - {order.customerName}
                    </Text>
                  </Group>

                  {/* Whatsapp */}
                  <Group style={{ gap: 4 }} align="center">
                    <IconBrandWhatsapp size={18} />
                    <Text size="sm" c="dimmed">
                      {order.customerPhone}
                    </Text>
                  </Group>

                  {/* Order Date */}
                  <Text size="sm">
                    <strong>Realizado em:</strong> {dayjs.utc(order.createdAt).format(`DD/MM/YYYY - HH:mm (dddd)`)}
                  </Text>
                </Group>
                <Box>
                  <Badge leftSection={statusIcons[order.status]} color={badgeColor[order.status]} variant="outline">
                    {order.status}
                  </Badge>
                </Box>
              </Group>
            </Group>
            <Group>
              <Stack>
                <Group>
                  <Text size="xs">
                    <strong>Data de Entrega:</strong> {dayjs.utc(order.deliveryDate).format('DD/MM/YYYY')}
                  </Text>
                  <Text size="xs">
                    <strong>Data Comercial:</strong> {dayjs.utc(order.commercialDate).format('DD/MM/YYYY')}
                  </Text>
                </Group>
                <Text size="xs">
                  <strong>Valor Total: </strong> {totalDisplay}
                </Text>
              </Stack>
            </Group>

            {/* Actions */}
            <Group justify="space-between">
              <Button
                size="xs"
                variant="subtle"
                leftSection={expandedOrder === order.id ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                onClick={() => toggleOrderItems(order.id)}
              >
                {expandedOrder === order.id ? 'Hide Items' : 'Show Items'}
              </Button>
              <Group>
                <LongPressButton
                  buttonProps={{
                    variant: 'light',
                    color: 'matcha',
                    size: 'xs',
                    disabled: completedOrders.includes(order.id),
                  }}
                  iconColor="matcha"
                  durationMs={700}
                  onLongPress={() => {
                    if (completedOrders.includes(order.id)) return
                    // Send request to Complete order to BE
                    setCompletedOrders([...completedOrders, order.id])
                  }}
                >
                  Confirmar
                </LongPressButton>
                <Button
                  size="xs"
                  variant="light"
                  color="blue"
                  leftSection={<IconPencil size={18} />}
                  onClick={() => {
                    alert(`Edit order ${order.id}`)
                  }}
                >
                  Alterar
                </Button>
                <LongPressButton
                  buttonProps={{
                    variant: 'light',
                    color: 'red',
                    size: 'xs',
                    disabled: completedOrders.includes(order.id),
                  }}
                  iconColor="red"
                  iconLongPressed={<IconX />}
                  durationMs={700}
                  onLongPress={() => {
                    if (completedOrders.includes(order.id)) return
                    // Send request to Complete order to BE
                    setCompletedOrders([...completedOrders, order.id])
                  }}
                >
                  Cancelar
                </LongPressButton>
              </Group>
            </Group>
          </Stack>

          {/* Collapsible Order Items */}
          <Collapse in={expandedOrder === order.id}>
            <Table mt="md" highlightOnHover verticalSpacing="xs" withRowBorders={false}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Produto</Table.Th>
                  <Table.Th>Tamanho</Table.Th>
                  <Table.Th>Quantidade</Table.Th>
                  <Table.Th>Preço</Table.Th>
                  <Table.Th>Total</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {order.orderItems.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.productName}</Table.Td>
                    <Table.Td>{item.availabilityName}</Table.Td>
                    <Table.Td>{item.qty}</Table.Td>
                    <Table.Td>{BRL.format(item.price)}</Table.Td>
                    <Table.Td>{BRL.format(item.qty * item.price)}</Table.Td>
                  </Table.Tr>
                ))}
                <Table.Tr>
                  <Table.Td></Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td c="matcha" fw={800}>
                    Total do Pedido:
                  </Table.Td>
                  <Table.Td c="matcha" fw={800}>
                    {totalDisplay}
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
              <Table.Tfoot></Table.Tfoot>
            </Table>
          </Collapse>
        </Card>
      )
    })
  }

  if (isLoading) return <DefaultLoadingOverlay visible={isLoading} />
  if (error) {
    console.log(`error`, error)
    // showErrorToast('Problema ao ler pedidos', 'Houve um problema ao consultar os pedidos. Verifique a conexão')
  }

  return (
    <Stack>
      {renderOrders(data?.entries[OrderStatus.DRAFT])}
      {/* {renderOrders(data?.entries[OrderStatus.CONFIRMED])} */}
    </Stack>
  )
}

export default DashboardOrders
