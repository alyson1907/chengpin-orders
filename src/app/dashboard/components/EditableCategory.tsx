import { handleResponseError } from '@/app/helpers/handle-request-error'
import { isNotValid } from '@/app/helpers/validate-helper'
import { ActionIcon, Badge, Box, Collapse, Group, Switch, Text, TextInput, Tooltip } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'

type IProps = {
  category: {
    id: string
    name: string
    visible: boolean
    categoryProduct: any[]
  }
  isEditable: boolean
  selected?: boolean
  onClick?: () => void
  afterUpdate?: () => void
}

const EditableCategory = ({
  category,
  selected = false,
  isEditable,
  onClick = () => {},
  afterUpdate = () => {},
}: IProps) => {
  const [isOpenEditControls, { toggle: toggleEditControls, close: closeEditControls }] = useDisclosure(false)
  const [isCategoryVisible, setIsCategoryVisible] = useState(category.visible)
  const [switchForm, setForm] = useState<HTMLFormElement | null>(null)

  useEffect(() => {
    if (switchForm) switchForm.requestSubmit()
  }, [isCategoryVisible, switchForm])

  const form = useForm({
    initialValues: {
      categoryName: category.name,
    },
    validate: {
      categoryName: (value) => isNotValid(value, z.string().min(1)) && 'Não pode ser vazio',
    },
    transformValues: ({ categoryName }) => ({ categoryName: categoryName.trim() }),
  })

  const sendCategoryUpdates = async () => {
    const formValues = form.getTransformedValues()
    const updatedCategory = {
      id: category.id,
      name: form.isDirty('categoryName') ? formValues.categoryName : category.name,
      visible: isCategoryVisible,
    }
    const body = {
      data: [updatedCategory],
    }
    const res = await fetch('/api/category', { method: 'PATCH', body: JSON.stringify(body) })
    const resBody = await res.json()
    handleResponseError(resBody)
    afterUpdate()
  }

  const renderEditControls = (isEditable: boolean) => {
    return (
      <Collapse in={isEditable} mt="4px">
        <form
          id={`update-category-${category.id}`}
          onSubmit={async (e) => {
            e.preventDefault()
            closeEditControls()
            await sendCategoryUpdates()
          }}
        >
          <Collapse in={isOpenEditControls}>
            <TextInput size="xs" placeholder="Novo nome..." {...form.getInputProps('categoryName')} />
          </Collapse>
          <Group justify="space-between">
            <Switch
              size="xs"
              variant="transparent"
              checked={isCategoryVisible}
              onChange={(e) => {
                setIsCategoryVisible(!isCategoryVisible)
                setForm(e.target.form)
              }}
            />
            <ActionIcon variant="transparent" color="grey" onClick={() => toggleEditControls()}>
              {isOpenEditControls ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
        </form>
      </Collapse>
    )
  }

  return (
    <Group>
      <Box w="100%">
        <Group justify="space-between" onClick={onClick} styles={{ root: { cursor: 'pointer' } }}>
          <Tooltip label={category.name}>
            <Text
              size="sm"
              lineClamp={1}
              style={{ borderBottom: selected ? '1px solid var(--mantine-color-matcha-5)' : '' }}
              truncate
              {...(!isCategoryVisible && { c: 'dimmed', size: 'xs' })}
            >
              {category.name}
            </Text>
          </Tooltip>
          <Badge variant="transparent" styles={{ root: { cursor: 'pointer' } }}>
            {category.categoryProduct.length}
          </Badge>
        </Group>
        {renderEditControls(isEditable)}
      </Box>
    </Group>
  )
}

export default EditableCategory
