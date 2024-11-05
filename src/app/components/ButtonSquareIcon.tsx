import { Button, ButtonProps } from '@mantine/core'

type IProps = {
  onClick?: () => void
  size?: number
  icon: React.ReactNode
  styles?: ButtonProps
}

const ButtonSquareIcon = ({ onClick = () => {}, size = 40, icon, styles, ...props }: IProps) => {
  return (
    <Button onClick={onClick} p={0} m={0} w={size} h={size} {...styles} {...props} variant="outline">
      {icon}
    </Button>
  )
}

export default ButtonSquareIcon
