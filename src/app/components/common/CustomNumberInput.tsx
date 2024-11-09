import { NumberInput, NumberInputHandlers, NumberInputProps, UnstyledButton } from '@mantine/core'
import { Dispatch, useRef } from 'react'

type IProps = {
  value: number
  setValue: Dispatch<number>
} & NumberInputProps

const CustomNumberInput = ({ value, setValue, ...props }: IProps) => {
  const handlersRef = useRef(null)

  const minusBtn = () => (
    <UnstyledButton
      onClick={() => {
        const handlers = handlersRef?.current as unknown as NumberInputHandlers
        handlers.decrement()
      }}
      fw={500}
    >
      -
    </UnstyledButton>
  )

  const plusBtn = () => (
    <UnstyledButton
      onClick={() => {
        const handlers = handlersRef?.current as unknown as NumberInputHandlers
        handlers.increment()
      }}
      fw={500}
    >
      +
    </UnstyledButton>
  )

  return (
    <NumberInput
      handlersRef={handlersRef}
      {...props}
      value={value}
      onChange={(val) => {
        const newValue = parseInt(val.toString()) || 0
        setValue(newValue)
      }}
      leftSection={minusBtn()}
      rightSection={plusBtn()}
    />
  )
}

export default CustomNumberInput
