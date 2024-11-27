'use client'
import CurrencyNumberInput from '@/app/common/CurrencyNumberInput'
import CreateProductModal from '@/app/dashboard/products/CreateProductModal'
import { refreshCategoriesNavbar, refreshProductsList } from '@/app/dashboard/products/mutators'
import { handleResponseError } from '@/app/helpers/handle-request-error'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { isNotValid } from '@/app/helpers/validate-helper'
import {
  ActionIcon,
  AspectRatio,
  Box,
  Button,
  Card,
  Collapse,
  Flex,
  Group,
  Image,
  NumberInput,
  Switch,
  Table,
  Text,
  TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconChevronDown,
  IconChevronUp,
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { Dispatch, useState } from 'react'
import { z } from 'zod'

type IProps = {
  product: Record<string, any>
  expandedProductId: string | null
  setExpandedProductId: Dispatch<string | null>
}

type TAvailability = {
  id: string
  name: string
  productId: string
  price: number
  qty: number
}

const sendUpdateProduct = async (id: string, body: any) => {
  const res = await fetch('/api/product', { method: 'PUT', body: JSON.stringify({ data: [{ ...body, id }] }) })
  const resBody = await res.json()
  const isError = handleResponseError(resBody)
  if (isError) refreshProductsList()
  return resBody.data
}

const EditableProduct = ({ product, expandedProductId, setExpandedProductId }: IProps) => {
  const isTableExpanded = expandedProductId === product.id
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, { open: openProductModal, close: closeProductModal }] = useDisclosure(false)
  const [isEditingTable, setIsEditingTable] = useState(false)
  const [availability, setAvailability] = useState<TAvailability[]>(product.availability)
  const [errors, setErrors] = useState<Record<string, string | false>[]>([])

  const resetAvailabilities = () => {
    setAvailability(product.availability)
    setErrors([])
    setIsEditingTable(false)
  }

  const addEmptyRow = () => {
    const empty = {
      id: 'new-item-' + new Date().toISOString(),
      name: '',
      productId: product.id,
      price: 0,
      qty: 0,
    }
    setAvailability([...availability, empty])
  }

  const handleTableChange = (id: string, field, value) => {
    setAvailability(availability.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const validate = (availability: TAvailability[]) => {
    const errors = availability.map((a) => ({
      name: isNotValid(a.name, z.string().min(1)) && 'Tamanho obrigatório',
      price: isNotValid(a.price, z.number().gt(0)) && 'Preço inválido',
      qty: isNotValid(a.qty, z.number().int().gte(0)) && 'Quantidade inválida',
    }))
    setErrors(errors)
    return errors
  }

  const sendTableChanges = async () => {
    const validated = validate(availability)
    const someErrorFound = validated.some((e) => Object.values(e).some((isError) => isError))
    if (someErrorFound) return

    setIsLoading(true)
    const createdAvailabilities = availability.filter((a) => a.id.startsWith('new-item'))
    const updatedAvailabilities = availability.filter((a) => product.availability.map(({ id }) => id).includes(a.id))
    const removedAvailabilities = product.availability.filter((pa) => !availability.some((a) => a.id === pa.id))
    const createBody = {
      availabilities: createdAvailabilities.map((a) => ({
        productId: product.id,
        name: a.name,
        qty: a.qty,
        price: a.price,
      })),
    }
    const updateBody = {
      availabilities: updatedAvailabilities.map((a) => ({
        id: a.id,
        name: a.name,
        qty: a.qty,
        price: a.price,
      })),
    }
    const deleteBody = {
      availabilities: removedAvailabilities.map((a) => a.id),
    }

    const createdRes = await fetch('/api/availability', { method: 'POST', body: JSON.stringify(createBody) })
    const updatedRes = await fetch('/api/availability', { method: 'PUT', body: JSON.stringify(updateBody) })
    const deletedRes = await fetch('/api/availability', { method: 'DELETE', body: JSON.stringify(deleteBody) })
    const createdBody = await createdRes.json()
    const updatedBody = await updatedRes.json()
    const deletedBody = await deletedRes.json()
    const isErrorCreated = handleResponseError(createdBody)
    const isErrorUpdated = handleResponseError(updatedBody)
    const isErrorDeleted = handleResponseError(deletedBody)
    if (isErrorCreated || isErrorUpdated || isErrorDeleted) refreshProductsList()
    setAvailability([...createdBody.data, ...updatedBody.data])
    setIsEditingTable(false)
    setIsLoading(false)
  }

  const renderAvailabilityTable = () => {
    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tamanho</Table.Th>
            <Table.Th>Preço</Table.Th>
            <Table.Th>Quantidade</Table.Th>
            {isEditingTable && <Table.Th>Remover</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {availability.map((item, idx) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                {isEditingTable ? (
                  <TextInput
                    value={item.name}
                    onChange={(e) => handleTableChange(item.id, 'name', e.target.value)}
                    error={errors[idx] && errors[idx].name}
                  />
                ) : (
                  item.name
                )}
              </Table.Td>
              <Table.Td>
                {isEditingTable ? (
                  <CurrencyNumberInput
                    w={'90px'}
                    value={item.price}
                    onChange={(value) => {
                      handleTableChange(item.id, 'price', value || 0)
                    }}
                    error={errors[idx] && errors[idx].price}
                  />
                ) : (
                  `${BRL.format(item.price)}`
                )}
              </Table.Td>
              <Table.Td>
                {isEditingTable ? (
                  <NumberInput
                    w={'90px'}
                    value={item.qty}
                    min={0}
                    step={1}
                    stepHoldDelay={200}
                    stepHoldInterval={15}
                    allowDecimal={false}
                    allowNegative={false}
                    defaultValue={0}
                    onChange={(value) => handleTableChange(item.id, 'qty', value)}
                    error={errors[idx] && errors[idx].qty}
                  />
                ) : (
                  item.qty
                )}
              </Table.Td>
              {isEditingTable && (
                <Table.Td>
                  <ActionIcon
                    size="sm"
                    onClick={() => setAvailability(availability.filter((i) => i.id !== item.id))}
                    color="red"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    )
  }

  const renderTableControls = () => {
    return (
      <Group justify="flex-end">
        <Button size="xs" loading={isLoading} bg="indigo" leftSection={<IconPlus size={16} />} onClick={addEmptyRow}>
          Adicionar
        </Button>
        <Button size="xs" loading={isLoading} leftSection={<IconX size={16} />} onClick={resetAvailabilities}>
          Cancelar
        </Button>
        <Button size="xs" loading={isLoading} leftSection={<IconDeviceFloppy size={16} />} onClick={sendTableChanges}>
          Salvar
        </Button>
      </Group>
    )
  }

  return (
    <Card shadow="md" radius="sm" mt="sm" withBorder>
      <CreateProductModal
        product={product}
        opened={isModalOpen}
        onClose={closeProductModal}
        onSave={async (body) => {
          await sendUpdateProduct(product.id, body)
          refreshCategoriesNavbar()
          closeProductModal()
        }}
      />
      <Group p="md" align="flex-start">
        <Flex flex={1}>
          <AspectRatio ratio={3 / 4}>
            <Image src={product.coverImg} width={'100%'} height={'100%'} radius="sm" alt={product.name} />
          </AspectRatio>
        </Flex>
        <Flex flex={5}>
          <Box>
            <Text fw={700}>{product.name}</Text>
            <Text size="sm" lineClamp={2}>
              {product.description}
            </Text>
          </Box>
        </Flex>
        <Flex flex={6} justify={'flex-end'}>
          <Button size="xs" leftSection={<IconEdit size={16} />} onClick={() => openProductModal()}>
            Alterar
          </Button>
        </Flex>
      </Group>

      {/* Availability Table Section */}
      <Box style={{ padding: '16px' }}>
        <Button
          leftSection={isTableExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          variant="subtle"
          size="xs"
          onClick={() => (isTableExpanded ? setExpandedProductId(null) : setExpandedProductId(product.id))}
        >
          {isTableExpanded ? 'Esconder' : 'Mostrar'}
        </Button>
        <Collapse in={isTableExpanded}>
          {renderAvailabilityTable()}
          <Group mt="md" justify="space-between">
            <Switch
              label="Habilitar edição"
              checked={isEditingTable}
              onChange={(e) => {
                const checked = e.target.checked
                if (!checked) resetAvailabilities()
                setIsEditingTable(checked)
              }}
            />
            {isEditingTable && renderTableControls()}
          </Group>
        </Collapse>
      </Box>
    </Card>
  )
}

export default EditableProduct
