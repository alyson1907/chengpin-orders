import {
  Button,
  Group,
  InputBase,
  Modal,
  ModalProps,
  NumberInput,
  Select,
  Stack,
  Table,
  TextInput,
  Title,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import dayjs from '@/app/api/common/dayjs'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { IMaskInput } from 'react-imask'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react'
import useSWR from 'swr'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'
import { showErrorToast } from '@/app/helpers/handle-request-error'
import ButtonSquareIcon from '@/app/components/common/ButtonSquareIcon'

type IProps = {
  order: any
} & ModalProps

const fetcher = async (url: string) => {
  const qs = new URLSearchParams({
    qty__gte: '1',
  })
  const res = await fetch(`${url}?${qs}`)
  const body = await res.json()
  return body.data.entries
}

const buildOrderUpdateRequest = (editedOrder, editedOrderItems) => {
  const body = {
    deliveryDate: dayjs.utc(editedOrder.deliveryDate).format('YYYY-MM-DD'),
    commercialDate: dayjs.utc(editedOrder.commercialDate).format('YYYY-MM-DD'),
    customerKey: editedOrder.customerKey,
    customerName: editedOrder.customerName,
    customerPhone: editedOrder.customerPhone,
    orderItems: editedOrderItems.map(({ availabilityId, qty }) => ({ id: availabilityId, qty })),
  }
  return body
}

const reduceAvailablesSelect = (availables) => {
  if (!availables) return
  return availables.map((a) => ({ value: a.id, label: `${a.product.name} (${a.name}) ` }))
}

const EditOrderModal = ({ order, ...props }: IProps) => {
  const { data: availables, error, isLoading } = useSWR('/api/availability', fetcher)
  const availablesSelectData = useMemo(() => reduceAvailablesSelect(availables), [availables])
  const [editingOrder, setEditingOrder] = useState<any>()
  const [editingItems, setEditingItems] = useState<Array<any>>()
  const [itemToAdd, setItemToAdd] = useState<string | null>(null)

  useEffect(() => {
    const editingOrder = { ...order }
    const editingItems = [...order.orderItems]
    const ignoreFields = ['createdAt', 'updatedAt']
    const dateFields = ['deliveryDate', 'commercialDate']
    delete editingOrder.orderItems
    ignoreFields.forEach((field) => {
      delete editingOrder[field]
    })
    dateFields.forEach((dateField) => {
      editingOrder[dateField] = dayjs.utc(editingOrder[dateField]).toDate()
    })
    editingItems.forEach((item) => {
      ignoreFields.forEach((field) => {
        delete item[field]
      })
    })
    setEditingOrder(editingOrder)
    setEditingItems(editingItems)
  }, [order])

  const handleOrderChangeValue = (key, value) => {
    setEditingOrder({ ...editingOrder, [key]: value })
  }

  const renderEditOrder = (editingOrder) => {
    return (
      <Stack>
        <Title order={5}>Informações do Pedido</Title>
        <Group>
          <Group>
            <InputBase
              label="Chave"
              placeholder="0000"
              value={editingOrder?.customerKey}
              component={IMaskInput}
              mask={[{ mask: '0000' }]}
              onChange={(e) => {
                e.preventDefault()
                const event = e as ChangeEvent<HTMLInputElement>
                handleOrderChangeValue('customerKey', event.target.value)
              }}
            />

            <TextInput
              label="Nome"
              value={editingOrder?.customerName}
              onChange={(e) => handleOrderChangeValue('customerName', e.target.value)}
            />

            <InputBase
              key={'phone'}
              label="Whatsapp"
              placeholder="(15) 9999-3333"
              value={editingOrder?.customerPhone}
              component={IMaskInput}
              mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
              onChange={(e) => {
                e.preventDefault()
                const event = e as ChangeEvent<HTMLInputElement>
                handleOrderChangeValue('customerPhone', event.target.value)
              }}
            />
          </Group>
          <Group>
            <DateInput
              valueFormat="DD/MM/YYYY (ddd)"
              label="Data de entrega"
              placeholder="Data de entrega"
              minDate={new Date()}
              value={editingOrder?.deliveryDate}
              onChange={(value) => {
                const date = dayjs(value).toDate()
                handleOrderChangeValue('deliveryDate', date)
              }}
            />
            <DateInput
              valueFormat="DD/MM/YYYY (ddd)"
              label="Data comercial"
              placeholder="Data comercial"
              minDate={editingOrder?.deliveryDate}
              value={editingOrder?.commercialDate}
              onChange={(value) => {
                const date = dayjs(value).toDate()
                handleOrderChangeValue('commercialDate', date)
              }}
            />
          </Group>
        </Group>
      </Stack>
    )
  }

  const addItem = (itemId) => {
    if (!itemId || !editingItems || editingItems.some((e) => e.availabilityId === itemId)) return
    const availability = availables.find((a) => a.id === itemId)
    if (!availability) return showErrorToast('Falha ao adicionar item', 'Item não encontrado')
    const newItem = {
      productId: availability.product.id,
      availabilityId: availability.id,
      orderId: editingOrder.id,
      productName: availability.product.name,
      availabilityName: availability.name,
      qty: 1,
      price: availability.price,
    }
    setEditingItems([...editingItems, newItem])
  }

  const removeItem = (itemId) => {
    if (!editingItems) return
    const newItems = editingItems.filter((e) => itemId !== e.availabilityId)
    setEditingItems(newItems)
  }

  const renderEditItems = (editingItems) => {
    const totalPrice = editingItems?.reduce((total: number, item: any) => total + item.price * item.qty, 0) || 0
    const totalDisplay = BRL.format(totalPrice)
    return (
      <>
        <Title order={5} mt="xl">
          Itens do Pedido
        </Title>
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
            {editingItems?.map((item, idx) => {
              const availability = availables.find((a) => a.id === item.availabilityId)
              return (
                <Table.Tr key={idx}>
                  <Table.Td>{item.productName}</Table.Td>
                  <Table.Td>{item.availabilityName}</Table.Td>
                  <Table.Td>
                    <NumberInput
                      description={`Max: ${availability.qty}`}
                      w={'75px'}
                      value={item.qty}
                      min={1}
                      max={availability.qty}
                      step={1}
                      stepHoldDelay={200}
                      stepHoldInterval={15}
                      onChange={(value) => {
                        const prev = [...editingItems]
                        const edited = prev.map((e) =>
                          e.availabilityId === item.availabilityId ? { ...e, qty: value } : e
                        )
                        setEditingItems(edited)
                      }}
                    />
                  </Table.Td>
                  <Table.Td>{BRL.format(item.price)}</Table.Td>
                  <Table.Td>{BRL.format(item.qty * item.price)}</Table.Td>
                  <Table.Td>
                    <ButtonSquareIcon icon={<IconTrash size={16} onClick={() => removeItem(item.availabilityId)} />} />
                  </Table.Td>
                </Table.Tr>
              )
            })}
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
      </>
    )
  }

  if (isLoading) return <DefaultLoadingOverlay />
  if (error) {
    showErrorToast('Problema ao coletar produos disponíveis', 'Verifique sua conexão')
    return <></>
  }
  return (
    <Modal {...props} size="xl" closeOnClickOutside={false}>
      {renderEditOrder(editingOrder)}
      {renderEditItems(editingItems)}
      <Group justify="space-between" mt="md">
        <form
          style={{ flex: 1, display: 'flex', flexGrow: 1 }}
          id="add-item-to-order-form"
          onSubmit={(e) => {
            e.preventDefault()
            addItem(itemToAdd)
          }}
        >
          <Group w="100%">
            <Select
              w={300}
              placeholder="Adicionar item..."
              data={availablesSelectData}
              nothingFoundMessage="Não encontrado..."
              onChange={(value) => setItemToAdd(value)}
              searchable
            />
            <Button leftSection={<IconPlus />} type="submit">
              Adicionar Item
            </Button>
          </Group>
        </form>
        <Button
          leftSection={<IconDeviceFloppy />}
          onClick={() => {
            const body = buildOrderUpdateRequest(editingOrder, editingItems)
            console.log(`order.id`, order.id)
            console.log(`body`, body)
          }}
        >
          Salvar
        </Button>
      </Group>
    </Modal>
  )
}

export default EditOrderModal
