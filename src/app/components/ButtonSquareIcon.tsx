import { Button, ButtonProps } from '@mantine/core'

type IProps = {
  onClick?: () => void
  size?: number
  icon: React.ReactNode
  styles?: ButtonProps
}

export default function ButtonSquareIcon({ onClick = () => {}, size = 40, icon, styles, ...props }: IProps) {
  return (
    <Button onClick={onClick} p={0} m={0} w={size} h={size} {...styles} {...props}>
      {icon}
    </Button>
  )
}
