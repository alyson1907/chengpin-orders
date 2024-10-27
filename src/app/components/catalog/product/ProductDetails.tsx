import { Modal } from '@mantine/core'

type IProps = {
  isOpen: boolean
  onClose: () => void
}

export default function ProductDetails({ isOpen, onClose }: IProps) {
  return (
    <>
      <Modal opened={isOpen} onClose={onClose} withCloseButton={false} centered>
        Meu modal aqui!
      </Modal>
    </>
  )
}
