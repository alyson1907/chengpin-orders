import css from '@/app/common/SelectThumb.module.css'
import { AspectRatio, Box, Group, GroupProps, Image, Stack, Text } from '@mantine/core'
import { IconGhost, IconSquareXFilled } from '@tabler/icons-react'

type IProps = {
  thumbSize?: number
  imageUrls: string[]
  selectedIdx: number
  onThumbSelect: (idx: number) => void
  onThumbRemove?: (idx: number) => void
} & GroupProps

const placeholder = () => {
  return (
    <Group justify="center" w="100%" p="sm">
      <Stack align="center">
        <IconGhost color="grey" />
        <Text c="grey">Aguardando imagens...</Text>
      </Stack>
    </Group>
  )
}

const SelectThumb = ({
  thumbSize = 75,
  imageUrls,
  selectedIdx,
  onThumbSelect,
  onThumbRemove = () => {},
  ...props
}: IProps) => {
  const thumbnails = () => {
    return imageUrls.map((src, idx) => (
      <Box key={src + idx} className={`${css.imageThumbContainer} ${selectedIdx === idx ? css.selected : ''}`}>
        <Group
          h={18}
          style={{ cursor: 'pointer', position: 'absolute', zIndex: 1, right: 0 }}
          onClick={() => onThumbRemove(idx)}
        >
          <IconSquareXFilled size={18} stroke={2} color="var(--mantine-color-red-5)" />
        </Group>
        <Box onClick={() => onThumbSelect(idx)}>
          <AspectRatio ratio={1 / 1}>
            <Image src={src} w={thumbSize} alt="Thumb image selector" />
          </AspectRatio>
        </Box>
      </Box>
    ))
  }

  return (
    <Group p="md" justify="center" gap="lg" {...props}>
      {imageUrls.length ? thumbnails() : placeholder()}
    </Group>
  )
}

export default SelectThumb
