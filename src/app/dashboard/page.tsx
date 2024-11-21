'use client'
import dayjs from '@/app/api/common/dayjs'
import { HttpStatus } from '@/app/api/common/enum/http-status.enum'
import { OrderStatus } from '@/app/api/order/order-status.enum'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'
import LongPressButton from '@/app/components/common/LongPressButton'
import OrdersTabs from '@/app/dashboard/orders/OrdersTabs'
import { handleResponseError, showErrorToast } from '@/app/helpers/handle-request-error'
import { useMantineColor } from '@/app/helpers/hooks'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { openWhatsapp } from '@/app/helpers/thirdparty-helper'
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
  IconTruckDelivery,
  IconReceipt2,
} from '@tabler/icons-react'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import useSWR, { mutate } from 'swr'

const fetcher = async ([url, filter]: [
  string,
  { searchCustomerKey: string; searchCustomerName: string; orderBy: string; orderDirection: string }
]) => {
  const searchCustomerKey = filter.searchCustomerKey
  const searchCustomerName = filter.searchCustomerName
  const orderBy = filter.orderBy || 'createdAt'
  const orderDirection = filter.orderDirection || 'desc'
  const orderFilter = { [`orderBy__${orderDirection}`]: orderBy }

  const ordersPromise = Object.entries(OrderStatus).map(async ([key, value]) => {
    const baseFilter = {
      ...orderFilter,
      status: value,
    }
    if (searchCustomerKey) baseFilter['customerKey__contains'] = searchCustomerKey
    if (searchCustomerName) baseFilter['customerName__contains'] = searchCustomerName
    const qs = new URLSearchParams(baseFilter)
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
const confirmOrder = async (orderId: string) => fetch(`/api/order/confirm/${orderId}`, { method: 'POST' })
const cancelOrder = async (orderId: string) => fetch(`/api/order/cancel/${orderId}`, { method: 'POST' })
const calculateTotal = (order: any) =>
  order.orderItems.reduce((total: number, item: any) => total + item.price * item.qty, 0)
const buildWhatsappMessage = (order: any) => {
  return `Olá, tudo bem? Agradecemos escolher a Chengpin!

Acabamos de receber seu pedido, vamos confirmar?

🌸 *[ Informações do Pedido ]*
    - *Chave*: ${order.customerKey}
    - *Nome*: ${order.customerName}
    - *Data de Entrega*: ${dayjs.utc(order.deliveryDate).format('DD/MM/YYYY')}
    - *Data Comercial*: ${dayjs.utc(order.commercialDate).format('DD/MM/YYYY')}

🚚 *[ Itens Inclusos ]*
${order.orderItems
  .map(
    (item) =>
      `    - *${item.productName} - ${item.availabilityName}* (${item.qty} x ${BRL.format(
        item.price
      )}) | Total: ${BRL.format(item.qty * item.price)}`
  )
  .join('\n')}

*Total do Pedido:* ${BRL.format(calculateTotal(order))}

Por favor, me responda confirmando se o pedido está correto, assim podemos combinar o restante, ok?`
}

const badgeColor = {
  DRAFT: 'orange',
  CONFIRMED: 'matcha',
  CANCELLED: 'grey',
}

const statusTranslation = {
  DRAFT: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
}

const DashboardOrders = () => {
  const [filter, setFilter] = useState({
    searchCustomerKey: '',
    searchCustomerName: '',
    orderBy: '',
    orderDirection: '',
  })
  const { data, error, isLoading } = useSWR(['/api/order', filter], fetcher)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [loadingOrders, setLoadingOrders] = useState<Array<string>>([])
  const [completedOrders, setCompletedOrders] = useState<Array<string>>([])
  const isCompleted = (orderId: string) => completedOrders.includes(orderId)
  const isOrderLoading = (orderId: string) => loadingOrders.includes(orderId)

  useEffect(() => {
    mutate('/api/order')
  }, [filter])

  const handleOrderConfirmation = async (orderId: string) => {
    if (isCompleted(orderId)) return showErrorToast('Pedido Confirmado', `Esse pedido já está confirmado`)
    setLoadingOrders([...loadingOrders, orderId])
    const res = await confirmOrder(orderId)
    const body = await res.json()
    if (res.status !== HttpStatus.OK) return handleResponseError(body)
    setCompletedOrders([...completedOrders, orderId])
    setLoadingOrders(_.remove(loadingOrders, (completingId) => completingId === orderId))
  }

  const handleOrderCancel = async (orderId: string) => {
    if (isCompleted(orderId)) return showErrorToast('Pedido Cancelado', `Esse pedido já está cancelado`)
    setLoadingOrders([...loadingOrders, orderId])
    const res = await cancelOrder(orderId)
    const body = await res.json()
    if (res.status !== HttpStatus.OK) return handleResponseError(body)
    setCompletedOrders([...completedOrders, orderId])
    setLoadingOrders(_.remove(loadingOrders, (completingId) => completingId === orderId))
  }

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
      const isCurrentlyCompleted = isCompleted(order.id)
      const isCurrentlyLoading = isOrderLoading(order.id)
      const totalPrice = calculateTotal(order)
      const totalDisplay = BRL.format(totalPrice)
      const itemsQty = order.orderItems.length
      return (
        <Card key={order.id} shadow="md" radius="sm" mt="sm" withBorder>
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
                  <Group
                    style={{ gap: 4, cursor: order.status === OrderStatus.DRAFT ? 'pointer' : 'auto' }}
                    align="center"
                    onClick={() =>
                      order.status === OrderStatus.DRAFT &&
                      openWhatsapp(order.customerPhone, buildWhatsappMessage(order))
                    }
                  >
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
                    {statusTranslation[order.status]}
                  </Badge>
                </Box>
              </Group>
            </Group>
            <Group>
              <Stack>
                <Group>
                  <Group style={{ gap: 4 }} align="center">
                    <IconTruckDelivery size={18} />
                    <Text size="xs">
                      <strong>Entrega: </strong> {dayjs.utc(order.deliveryDate).format('DD/MM/YYYY')}
                    </Text>
                  </Group>
                  <Group style={{ gap: 4 }} align="center">
                    <IconReceipt2 size={18} />
                    <Text size="xs">
                      <strong>Comercial: </strong> {dayjs.utc(order.commercialDate).format('DD/MM/YYYY')}
                    </Text>
                  </Group>
                </Group>
                <Group>
                  <Text size="xs">
                    <strong>Produtos: </strong> {itemsQty}
                  </Text>
                  <Text size="xs">
                    <strong>Valor Total: </strong> {totalDisplay}
                  </Text>
                </Group>
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
              {order.status === OrderStatus.DRAFT && (
                <Group>
                  <LongPressButton
                    buttonProps={{
                      variant: 'light',
                      color: 'matcha',
                      size: 'xs',
                      disabled: isCurrentlyCompleted,
                      loading: isCurrentlyLoading,
                    }}
                    iconColor="matcha"
                    durationMs={600}
                    onLongPress={() =>
                      handleOrderConfirmation(order.id).then(() => (order.status = OrderStatus.CONFIRMED))
                    }
                  >
                    Confirmar
                  </LongPressButton>
                  <Button
                    size="xs"
                    variant="light"
                    color="blue"
                    loading={isCurrentlyLoading}
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
                      disabled: isCurrentlyCompleted,
                      loading: isCurrentlyLoading,
                    }}
                    iconColor="red"
                    iconLongPressed={<IconX />}
                    durationMs={600}
                    onLongPress={() => handleOrderCancel(order.id).then(() => (order.status = OrderStatus.CANCELLED))}
                  >
                    Cancelar
                  </LongPressButton>
                </Group>
              )}
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
  if (error) showErrorToast('Problema ao ler pedidos', 'Houve um problema ao consultar os pedidos. Verifique a conexão')

  return (
    <Group justify="center">
      <OrdersTabs
        applyFilters={setFilter}
        draftOrders={renderOrders(data?.entries[OrderStatus.DRAFT])}
        confirmedOrders={renderOrders(data?.entries[OrderStatus.CONFIRMED])}
        cancelledOrders={renderOrders(data?.entries[OrderStatus.CANCELLED])}
        draftQty={data?.entries[OrderStatus.DRAFT]?.length || 0}
        confirmedQty={data?.entries[OrderStatus.CONFIRMED]?.length || 0}
        cancelledQty={data?.entries[OrderStatus.CANCELLED]?.length || 0}
      />
    </Group>
  )
}

export default DashboardOrders
