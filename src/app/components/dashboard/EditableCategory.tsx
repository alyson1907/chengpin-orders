import { handleResponseError } from '@/app/helpers/handle-request-error'
import { ActionIcon, Text, Group, Collapse, TextInput, Box, Switch, Tooltip } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { z, ZodSchema } from 'zod'

type IProps = {
  category: {
    id: string
    name: string
    visible: boolean
  }
  isEditable: boolean
  selected?: boolean
  onClick?: () => void
  onUpdate?: () => void
}
const isNotValid = (schema: ZodSchema, value: any) => !schema.safeParse(value).success

const EditableCategory = ({
  category,
  selected = false,
  isEditable,
  onClick = () => {},
  onUpdate = () => {},
}: IProps) => {
  const [isOpenEditControls, { toggle: toggleEditControls }] = useDisclosure(false)
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
      categoryName: (value) => isNotValid(z.string().min(1), value) && 'Não pode ser vazio',
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
    onUpdate()
  }

  const renderEditControls = (isEditable: boolean) => {
    return (
      <Collapse in={isEditable} mt="4px">
        <form
          id={`update-category-${category.id}`}
          onSubmit={async (e) => {
            e.preventDefault()
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
        <Tooltip label={category.name}>
          <Text
            size="sm"
            lineClamp={1}
            styles={{ root: { cursor: 'pointer', borderBottom: selected ? '2px solid pink' : '' } }}
            {...(!isCategoryVisible && { c: 'dimmed', size: 'xs' })}
            onClick={onClick}
          >
            {category.name}
          </Text>
        </Tooltip>
        {renderEditControls(isEditable)}
      </Box>
    </Group>
  )
}

export default EditableCategory
