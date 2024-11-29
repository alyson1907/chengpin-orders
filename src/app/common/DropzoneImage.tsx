import { showErrorToast } from '@/app/helpers/handle-request-error'
import { Flex, Stack, Text, rem } from '@mantine/core'
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react'

const DropzoneImage = (props: DropzoneProps) => {
  return (
    <Dropzone
      onReject={(files) => showErrorToast('Arquivo Rejeitado', `Motivo: ${files[0].errors[0].message}`)}
      maxSize={15 * 1024 ** 2}
      accept={IMAGE_MIME_TYPE}
      {...props}
    >
      <Stack justify="center" align="center" mih={220} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload style={{ width: rem(52), height: rem(52) }} stroke={1.5} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX style={{ width: rem(52), height: rem(52), color: 'red' }} stroke={1.5} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
        </Dropzone.Idle>

        <Flex align="center" direction="column">
          <Text size="xl" inline>
            Upload de imagens
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Anexe quantas imagens desejar até 15mb cada
          </Text>
        </Flex>
      </Stack>
    </Dropzone>
  )
}

export default DropzoneImage
