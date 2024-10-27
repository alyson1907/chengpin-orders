import { Skeleton, Stack, Group } from '@mantine/core'

type IProps = {
  visible: boolean
}

export default function GridSkeleton({ visible }: IProps) {
  return (
    <div>
      <Skeleton visible={visible} h={300} radius="md" />
      <Skeleton visible={visible} h={300} mt="md" radius="md" />
    </div>
  )
}
