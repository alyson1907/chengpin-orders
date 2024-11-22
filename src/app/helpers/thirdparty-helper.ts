export const openWhatsapp = (phone: string, text: string) => {
  const phoneNumber = `550${phone.replaceAll(/\D/g, '')}`
  const qs = new URLSearchParams({
    phone: phoneNumber,
    text,
  })
  window.open(`https://api.whatsapp.com/send/?${qs}`)
  window.focus()
}
