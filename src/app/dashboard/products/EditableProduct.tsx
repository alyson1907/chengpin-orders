'use client'
import ProductModal from '@/app/dashboard/products/ProductModal'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Collapse,
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
import { useState } from 'react'

const product = {
  id: '671eb95f25795b7453439aad',
  name: 'Cactocásia',
  description: 'Dynamic',
  coverImg: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
  imgs: [
    'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
    'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
    'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg',
    'https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg',
  ],
  availability: [
    {
      id: '671eb95f25795b7453439ab0',
      name: 'Camada 10x8',
      productId: '671eb95f25795b7453439aad',
      price: 10.99,
      qty: 25,
    },
    {
      id: '671eb95f25795b7453439ab2',
      name: 'Pote 14',
      productId: '671eb95f25795b7453439aad',
      price: 14.99,
      qty: 24,
    },
    {
      id: '671eb95f25795b7453439aaf',
      name: 'Pote 15',
      productId: '671eb95f25795b7453439aad',
      price: 9.99,
      qty: 24,
    },
    {
      id: '671eb95f25795b7453439aae',
      name: 'Pote 9',
      productId: '671eb95f25795b7453439aad',
      price: 8.99,
      qty: 11,
    },
    {
      id: '671eb95f25795b7453439ab1',
      name: 'Unidade',
      productId: '671eb95f25795b7453439aad',
      price: 12.99,
      qty: 25,
    },
  ],
}

const EditableProduct = () => {
  const [isModalOpen, { open: openProductModal, close: closeProductModal }] = useDisclosure(false)
  const [isTableExpanded, { toggle: toggleTableExpanded }] = useDisclosure(false)
  const [isCreateProduct, setIsCreateProduct] = useState(false)
  const [isEditingTable, setIsEditingTable] = useState(false)
  const [availability, setAvailability] = useState(product.availability)

  const handleTableChange = (id, field, value) => {
    setAvailability((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSaveTableChanges = () => {
    // Add your save logic here
    console.log(`handleSaveTableChanges`, availability)
    setIsEditingTable(false)
  }

  const renderAvailabilityTable = () => {
    return (
      <Table>
        <Table.Th>Tamanho</Table.Th>
        <Table.Th>Preço</Table.Th>
        <Table.Th>Quantidade</Table.Th>
        {isEditingTable && <Table.Th>Remover</Table.Th>}
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
      <Group p={16}>
        <Group>
          <Image src={product.coverImg} width={50} height={50} radius="md" alt="" />
          <Box>
            <Text fw={700} size="lg">
              {product.name}
            </Text>
            <Text size="sm">{product.description}</Text>
          </Box>
        </Group>
        <Button
          leftSection={<IconEdit size={16} />}
          onClick={() => {
            setIsCreateProduct(false)
            openProductModal()
          }}
        >
          Alterar
        </Button>
      </Group>

      {/* Availability Table Section */}
      <Box style={{ padding: '16px' }}>
        <Button
          leftSection={isTableExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          variant="subtle"
          size="xs"
          onClick={toggleTableExpanded}
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
                <Button size="xs" leftSection={<IconDeviceFloppy size={16} />} onClick={handleSaveTableChanges}>
                  Salvar
                </Button>
              </Group>
            )}
          </Group>
        </Collapse>
      </Box>

      <ProductModal
        product={product}
        isCreateProduct={isCreateProduct}
        opened={isModalOpen}
        onClose={closeProductModal}
        close={closeProductModal}
      />
    </Card>
  )
}

export default EditableProduct
