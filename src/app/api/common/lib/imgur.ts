const imgurUrl = process.env.IMGUR_BASE_URL
const auth = {
  Authorization: `Bearer ${process.env.IMGUR_ACCESS_TOKEN}`,
}

type TUploadImageOptions = {
  title?: string
  description?: string
}

const upload = async (file, options?: TUploadImageOptions) => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('type', 'image')
  if (options?.title) formData.append('title', options.title)
  if (options?.description) formData.append('description', options.description)
  const res = await fetch(`${imgurUrl}/image`, {
    method: 'POST',
    headers: auth,
    body: formData,
  })
  const body = await res.json()
  return body.data
}

const imgur = {
  upload,
}

export default imgur
