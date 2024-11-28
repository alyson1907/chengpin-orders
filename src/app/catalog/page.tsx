'use client'
import ProductGrid from '@/app/catalog/components/product/ProductGrid'
import { LayoutContext } from '@/app/catalog/layout/LayoutContextProvider'
import { isScreenSmaller, useBreakpoint } from '@/app/helpers/hooks'
import { isNotValid } from '@/app/helpers/validate-helper'
import { Group, Select, TextInput } from '@mantine/core'
import '@mantine/core/styles.css'
import { useForm } from '@mantine/form'
import { IconSearch } from '@tabler/icons-react'
import { FormEvent, useContext, useEffect, useState } from 'react'
import { z } from 'zod'

const CatalogMain = () => {
  const {
    navbar: { open },
  } = useContext(LayoutContext)
  const breakpoint = useBreakpoint()
  const isMobile = isScreenSmaller(breakpoint, 'sm')
  const [filters, setFilters] = useState<Record<string, any>>({
    productName: '',
    perPage: '8',
  })
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      productName: '',
      perPage: '8',
    },
    validate: {
      productName: () => true,
      perPage: (value) => isNotValid(value, z.string().regex(/\d/g)),
    },
    transformValues: (values) => ({
      productName: values.productName.trim(),
      perPage: parseInt(values.perPage.trim()),
    }),
  })

  useEffect(() => {
    if (!isMobile) open()
  }, [open, isMobile])

  const handleSubmit = (values: { productName: string; perPage: number }, e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    setFilters(values)
  }

  const renderFilters = () => {
    return (
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group>
          <TextInput
            flex={1}
            description="Buscar produto"
            placeholder="Alocasia..."
            rightSection={<IconSearch size={16} />}
            {...form.getInputProps('productName')}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              const formValues = form.getTransformedValues()
              handleSubmit(formValues)
            }}
          />
          {!isMobile && (
            <Select
              description="Itens por página"
              placeholder="Quantidade por página"
              maw={90}
              value={form.getValues().perPage.toString()}
              data={['8', '16', '20', '30', '40']}
              {...form.getInputProps('perPage')}
              onChange={(value) => {
                form.setFieldValue('perPage', value || '8')
                const formValues = form.getTransformedValues()
                handleSubmit(formValues)
              }}
            />
          )}
        </Group>
      </form>
    )
  }

  return (
    <>
      {renderFilters()}
      <ProductGrid productFilters={filters} />
    </>
  )
}

export default CatalogMain
