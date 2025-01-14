import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { Button, Center, DefaultMantineColor, Group, lighten, RingProgress, ThemeIcon } from '@mantine/core'
import { useInterval } from '@mantine/hooks'

import type { ButtonProps } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { useMantineColor } from '@/app/helpers/hooks'

type Props = {
  children: ReactNode
  iconLongPressed?: ReactNode
  iconColor?: DefaultMantineColor
  onLongPress?: () => void
  buttonProps?: ButtonProps
  durationMs?: number
  disabledWhenLongPressed?: boolean
}

const LongPressButton = ({
  children,
  iconColor = 'matcha',
  iconLongPressed = <IconCheck />,
  onLongPress,
  buttonProps,
  durationMs = 1000,
  disabledWhenLongPressed = true,
}: Props) => {
  const STEP_MS = 15
  const [progressValue, setProgressValue] = useState(0)
  const [wasLongPressExecuted, setLongPressExecuted] = useState(false)
  const interval = useInterval(() => {
    setProgressValue((current) => {
      const stepPercentage = (STEP_MS / durationMs) * 100
      return current + stepPercentage
    })
  }, STEP_MS)

  // * for Desktop
  const onMouseDownButton = () => {
    setProgressValue(0)
    interval.start()
  }
  const onMouseUpButton = () => {
    interval.stop()
    if (!(progressValue >= 100)) setProgressValue(0)
  }
  const onMouseLeaveButton = () => {
    interval.stop()
    if (!(progressValue >= 100)) setProgressValue(0)
  }
  // * for Touch Device
  const onTouchStartButton = () => {
    setProgressValue(0)
    interval.start()
  }
  const onTouchEndButton = () => {
    interval.stop()
    if (!(progressValue >= 100)) setProgressValue(0)
  }
  const onTouchCancelButton = () => {
    interval.stop()
    if (!(progressValue >= 100)) setProgressValue(0)
  }

  useEffect(() => {
    if (progressValue < 100 || !onLongPress) return
    if (wasLongPressExecuted) return
    onLongPress()
    setLongPressExecuted(true)
  }, [onLongPress, progressValue, wasLongPressExecuted])

  return (
    <Button
      {...buttonProps}
      onMouseDown={onMouseDownButton}
      onMouseUp={onMouseUpButton}
      onMouseLeave={onMouseLeaveButton}
      onTouchStart={onTouchStartButton}
      onTouchEnd={onTouchEndButton}
      onTouchCancel={onTouchCancelButton}
      disabled={buttonProps?.disabled || (disabledWhenLongPressed && progressValue >= 100)}
    >
      <Group>
        <RingProgress
          rootColor={lighten(useMantineColor(iconColor), 0.4)}
          label={
            progressValue >= 100 ? (
              <Center>
                <ThemeIcon color={iconColor} variant="filled" radius="lg" size={16}>
                  {iconLongPressed}
                </ThemeIcon>
              </Center>
            ) : null
          }
          size={20}
          thickness={4}
          sections={[{ value: progressValue, color: iconColor }]}
          defaultValue={0}
          style={{ top: -0.75 }}
        />
        {children}
      </Group>
    </Button>
  )
}

export default LongPressButton
