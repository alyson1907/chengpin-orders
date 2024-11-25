import { LoadingOverlay, LoadingOverlayProps } from '@mantine/core'

type IProps = {
  visible?: boolean
} & LoadingOverlayProps

export const DefaultLoadingOverlay = ({ visible = true, ...props }: IProps) => {
  return (
    <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2, center: true }} {...props} />
  )
}
