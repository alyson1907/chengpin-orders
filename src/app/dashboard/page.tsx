'use client'
import dayjs from '@/app/api/common/dayjs'
import { HttpStatus } from '@/app/api/common/enum/http-status.enum'
import { OrderStatus } from '@/app/api/order/order-status.enum'
import LongPressButton from '@/app/common/LongPressButton'
import EditOrderModal from '@/app/dashboard/orders/EditOrderModal'
import OrdersTabs from '@/app/dashboard/orders/OrdersTabs'
import { copyToClipboard } from '@/app/helpers/browser-helper'
import { handleResponseError, showErrorToast } from '@/app/helpers/handle-request-error'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { openWhatsapp } from '@/app/helpers/thirdparty-helper'
import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Collapse,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconBrandWhatsapp,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconKey,
  IconPencil,
  IconReceipt2,
  IconTruckDelivery,
  IconX,
} from '@tabler/icons-react'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

const countFetcher = async ([url, filter]: [
  string,
  { searchCustomerKey: string; searchCustomerName: string; orderBy: string; orderDirection: string }
]) => {
  const baseFilter = {}
  if (filter.searchCustomerKey) baseFilter['customerKey__contains'] = filter.searchCustomerKey
  if (filter.searchCustomerName) baseFilter['customerName__contains'] = filter.searchCustomerName
  const qs = new URLSearchParams(baseFilter)
  const res = await fetch(`${url}?${qs}`)
  const resbody = await res.json()
  handleResponseError(resbody)
  return resbody.data
}

const fetcher = async ([url, filter, pagination]: [
  string,
  { searchCustomerKey: string; searchCustomerName: string; orderBy: string; orderDirection: string },
  Record<string, { skip: number; take: number }>
]) => {
  const searchCustomerKey = filter.searchCustomerKey
  const searchCustomerName = filter.searchCustomerName
  const orderBy = filter.orderBy || 'createdAt'
  const orderDirection = filter.orderDirection || 'desc'
  const orderFilter = { [`orderBy__${orderDirection}`]: orderBy }

  const ordersPromise = Object.entries(OrderStatus).map(async ([key, value]) => {
    const paginationFilter = pagination[value]
    const baseFilter = {
      ...orderFilter,
      skip: paginationFilter.skip.toString(),
      take: paginationFilter.take.toString(),
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
      data: body.data || { entries: [], total: 0, totalFiltered: 0 },
    }
  })

  const orders = await Promise.all(ordersPromise)
  const formattedOrders = orders.reduce((acc, item) => {
    return { ...acc, [item.status]: item.data.entries }
  }, {})

  const result = {
    entries: formattedOrders,
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
  DRAFT: 'yellow',
  CONFIRMED: 'matcha',
  CANCELLED: 'grey',
}

const statusTranslation = {
  DRAFT: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
}

const DashboardOrders = () => {
  const [activeTab, setActiveTab] = useState<string | null>('draft')
  const perPage = 5
  const [draftPage, setDraftPage] = useState(1)
  const [confirmedPage, setConfirmedPage] = useState(1)
  const [cancelledPage, setCancelledPage] = useState(1)
  const [filter, setFilter] = useState({
    searchCustomerKey: '',
    searchCustomerName: '',
    orderBy: '',
    orderDirection: '',
  })
  const {
    data: count,
    isLoading: isLoadingCount,
    mutate: mutateCount,
  } = useSWR(['/api/order/status/count', filter], countFetcher)
  const { data, error, isLoading, mutate } = useSWR(
    [
      '/api/order',
      filter,
      {
        DRAFT: {
          skip: (draftPage - 1) * perPage,
          take: perPage,
        },
        CONFIRMED: {
          skip: (confirmedPage - 1) * perPage,
          take: perPage,
        },
        CANCELLED: {
          skip: (cancelledPage - 1) * perPage,
          take: perPage,
        },
      },
    ],
    fetcher
  )
  const [isEditOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [loadingOrders, setLoadingOrders] = useState<Array<string>>([])
  const [completedOrders, setCompletedOrders] = useState<Array<string>>([])
  const isCompleted = (orderId: string) => completedOrders.includes(orderId)
  const isOrderLoading = (orderId: string) => loadingOrders.includes(orderId)

  useEffect(() => {
    mutate()
    mutateCount()
  }, [filter, mutate, mutateCount])

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
    DRAFT: <IconClock size={16} color={'white'} />,
    CONFIRMED: <IconCheck size={16} color={'white'} />,
    CANCELLED: <IconX size={16} color={'white'} />,
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
                  <Tooltip label="Abrir Whatsapp" withArrow>
                    <Group
                      style={{ gap: 4, cursor: order.status === OrderStatus.DRAFT ? 'pointer' : 'auto' }}
                      align="center"
                      onClick={() => {
                        if (order.status !== OrderStatus.DRAFT) return
                        const wppMsg = buildWhatsappMessage(order)
                        copyToClipboard(wppMsg)
                        openWhatsapp(order.customerPhone, wppMsg)
                      }}
                    >
                      <IconBrandWhatsapp size={18} />
                      <Text size="sm" c="dimmed">
                        {order.customerPhone}
                      </Text>
                    </Group>
                  </Tooltip>

                  {/* Order Date */}
                  <Text size="sm">
                    <strong>Realizado em:</strong> {dayjs(order.createdAt).format(`DD/MM/YYYY - HH:mm (dddd)`)}
                  </Text>
                </Group>
                <Box>
                  <Badge leftSection={statusIcons[order.status]} color={badgeColor[order.status]} variant="filled">
                    {statusTranslation[order.status]}
                  </Badge>
                </Box>
              </Group>
            </Group>
            <Group>
              <SimpleGrid cols={2}>
                <Group style={{ gap: 4 }} align="center">
                  <IconTruckDelivery size={18} />
                  <Text size="xs">
                    <strong>Entrega: </strong> {dayjs(order.deliveryDate).format('DD/MM/YYYY')}
                  </Text>
                </Group>
                <Group style={{ gap: 4 }} align="center">
                  <IconReceipt2 size={18} />
                  <Text size="xs">
                    <strong>Comercial: </strong> {dayjs.utc(order.commercialDate).format('DD/MM/YYYY')}
                  </Text>
                </Group>
                <Text size="xs">
                  <strong>Produtos: </strong> {itemsQty}
                </Text>
                <Text size="xs">
                  <strong>Valor Total: </strong> {totalDisplay}
                </Text>
              </SimpleGrid>
            </Group>

            {/* Actions */}
            <Group justify="space-between">
              <Button
                size="xs"
                variant="subtle"
                leftSection={expandedOrder === order.id ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                onClick={() => toggleOrderItems(order.id)}
              >
                {expandedOrder === order.id ? 'Esconder' : 'Mostrar'}
              </Button>
              {order.status === OrderStatus.DRAFT && (
                <Group>
                  <LongPressButton
                    buttonProps={{
                      variant: 'outline',
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
                  <Button
                    size="xs"
                    variant="outline"
                    color="blue"
                    loading={isCurrentlyLoading}
                    leftSection={<IconPencil size={18} />}
                    onClick={() => {
                      setEditingOrder(order)
                      openEdit()
                    }}
                  >
                    Alterar
                  </Button>
                  <LongPressButton
                    buttonProps={{
                      variant: 'outline',
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
            </Table>
          </Collapse>
        </Card>
      )
    })
  }

  if (isLoading || isLoadingCount)
    return (
      <Center>
        <Loader />
      </Center>
    )
  if (error)
    showErrorToast('Problema ao carregar pedidos', 'Houve um problema ao consultar os pedidos. Verifique a conexão')

  return (
    <Stack p="xl" align="center">
      <Group>
        {editingOrder && (
          <EditOrderModal
            order={editingOrder}
            opened={isEditOpened}
            closeOnEscape={true}
            close={closeEdit}
            mutate={mutate}
            onClose={closeEdit}
          />
        )}
        <OrdersTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          applyFilters={setFilter}
          draftOrders={renderOrders(data?.entries[OrderStatus.DRAFT])}
          confirmedOrders={renderOrders(data?.entries[OrderStatus.CONFIRMED])}
          cancelledOrders={renderOrders(data?.entries[OrderStatus.CANCELLED])}
          draftQty={count.totalFilteredDraft}
          confirmedQty={count.totalFilteredConfirmed}
          cancelledQty={count.totalFilteredCancelled}
          draftPage={draftPage}
          confirmedPage={confirmedPage}
          cancelledPage={cancelledPage}
          perPage={perPage}
          draftOnPageChange={setDraftPage}
          confirmedOnPageChange={setConfirmedPage}
          cancelledOnPageChange={setCancelledPage}
        />
      </Group>
    </Stack>
  )
}

export default DashboardOrders
