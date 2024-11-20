'use client'
import '@mantine/core/styles.css'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Home = () => {
  const router = useRouter()
  useEffect(() => {
    router.push('/catalog')
  }, [router])
  return <></>
}

export default Home
