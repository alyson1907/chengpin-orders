import { Button, ButtonProps } from '@mantine/core'
import React, { PropsWithChildren } from 'react'
import css from './ButtonSquareIcon.module.css'

type IProps = {
  onClick?: () => void
  size?: number | string
  icon: React.ReactNode
  className?: string
  styles?: ButtonProps
} & PropsWithChildren

const ButtonSquareIcon = ({ onClick = () => {}, size = 40, icon, styles, children, ...props }: IProps) => {
  return (
    <Button
      onClick={onClick}
      p={0}
      m={0}
      w={size}
      h={size}
      {...styles}
      {...props}
      className={css.container}
      variant="subtle"
    >
      {icon}
      {children}
    </Button>
  )
}

export default ButtonSquareIcon
