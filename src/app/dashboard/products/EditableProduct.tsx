'use client'
import CreateProductModal from '@/app/dashboard/products/CreateProductModal'
import { refreshCaregoriesNavbar, refreshProductsList } from '@/app/dashboard/products/mutators'
import { handleResponseError } from '@/app/helpers/handle-request-error'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
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
import { IconChevronDown, IconChevronUp, IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react'
import { Dispatch, useState } from 'react'

type IProps = {
  product: Record<string, any>
  expandedProductId: string | null
  setExpandedProductId: Dispatch<string | null>
}

const sendUpdateProduct = async (id: string, body: any) => {
  const res = await fetch('/api/product', { method: 'PUT', body: JSON.stringify({ data: [{ ...body, id }] }) })
  const resBody = await res.json()
  handleResponseError(resBody)
  return resBody.data
}

const EditableProduct = ({ product, expandedProductId, setExpandedProductId }: IProps) => {
  const isTableExpanded = expandedProductId === product.id
  const [isModalOpen, { open: openProductModal, close: closeProductModal }] = useDisclosure(false)
  const [isEditingTable, setIsEditingTable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availability, setAvailability] = useState(product.availability)

  const handleTableChange = (id: string, field, value) => {
    setAvailability((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSaveTableChanges = () => {
    // Add your save logic here
    setIsLoading(true)
    console.log(`handleSaveTableChanges`, availability)
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
          {availability.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                {isEditingTable ? (
                  <TextInput value={item.name} onChange={(e) => handleTableChange(item.id, 'name', e.target.value)} />
                ) : (
                  item.name
                )}
              </Table.Td>
              <Table.Td>
                {isEditingTable ? (
                  <NumberInput
                    w={'90px'}
                    value={item.price}
                    min={0}
                    step={1}
                    stepHoldDelay={200}
                    stepHoldInterval={15}
                    decimalSeparator=","
                    decimalScale={2}
                    hideControls
                    onChange={(value) => handleTableChange(item.id, 'price', value)}
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
                    onChange={(value) => handleTableChange(item.id, 'qty', value)}
                  />
                ) : (
                  item.qty
                )}
              </Table.Td>
              {isEditingTable && (
                <Table.Td>
                  <ActionIcon
                    size="sm"
                    onClick={() => setAvailability((prev) => prev.filter((i) => i.id !== item.id))}
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

  return (
    <Card shadow="md" radius="sm" mt="sm" withBorder>
      <CreateProductModal
        product={product}
        opened={isModalOpen}
        onClose={closeProductModal}
        onSave={async (body) => {
          await sendUpdateProduct(product.id, body)
          closeProductModal()
          refreshProductsList()
          refreshCaregoriesNavbar()
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
              onChange={(e) => setIsEditingTable(e.target.checked)}
            />
            {isEditingTable && (
              <Group justify="flex-end">
                <Button size="xs" leftSection={<IconX size={16} />} onClick={() => setIsEditingTable(false)}>
                  Cancelar
                </Button>
                <Button
                  size="xs"
                  leftSection={<IconDeviceFloppy size={16} />}
                  loading={isLoading}
                  onClick={handleSaveTableChanges}
                >
                  Salvar
                </Button>
              </Group>
            )}
          </Group>
        </Collapse>
      </Box>
    </Card>
  )
}

export default EditableProduct
