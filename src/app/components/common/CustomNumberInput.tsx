import { NumberInput, NumberInputHandlers, NumberInputProps, UnstyledButton } from '@mantine/core'
import { Dispatch, useRef } from 'react'

type IProps = {
  value: number
  setValue: Dispatch<number>
  isPlusMinusButtons?: boolean
} & NumberInputProps

const CustomNumberInput = ({ value, setValue, isPlusMinusButtons = true, ...props }: IProps) => {
  const handlersRef = useRef(null)

  const minusBtn = () => (
    <UnstyledButton
      w={8}
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
      w={8}
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
      stepHoldDelay={200}
      stepHoldInterval={50}
      styles={() => ({ input: { textAlign: 'center' } })}
      {...props}
      value={value}
      onChange={(val) => {
        const newValue = parseInt(val.toString()) || 0
        setValue(newValue)
      }}
      leftSection={isPlusMinusButtons && minusBtn()}
      rightSection={isPlusMinusButtons && plusBtn()}
    />
  )
}

export default CustomNumberInput
