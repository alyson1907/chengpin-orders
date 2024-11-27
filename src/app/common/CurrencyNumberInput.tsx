import { NumberInput, NumberInputProps } from '@mantine/core'

const CurrencyNumberInput = ({ ...props }: NumberInputProps) => {
  return (
    <NumberInput
      w={'90px'}
      prefix="R$ "
      min={0}
      defaultValue={0}
      step={1}
      decimalSeparator=","
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      hideControls
      {...props}
    />
  )
}

export default CurrencyNumberInput
