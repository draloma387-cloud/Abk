import { Hono } from 'hono'

const app = new Hono()

app.get('/api/health', (c) => {
  return c.json({
    status: 'success',
    message: 'ABK Shortener is running!'
  })
})

app.post('/api/links', async (c) => {
  const data = await c.req.json()

  if (!data.url || !/^https?:\/\//i.test(data.url)) {
    return c.json({
      error: 'Please enter a valid URL'
    }, 400)
  }

  const id = crypto.randomUUID().slice(0, 8)

  const link = {
    id,
    url: data.url,
    title: data.title || '',
    description: data.description || '',
    image: data.image || '',
    clicks: 0
  }

  await c.env.LINKS.put(id, JSON.stringify(link))

  return c.json({
    success: true,
    shortId: id
  })
})

app.get('/:id', async (c) => {
  const link = await c.env.LINKS.get(c.req.param('id'))

  if (!link) {
    return c.text('Link not found', 404)
  }

  const data = JSON.parse(link)

  data.clicks = (data.clicks || 0) + 1

  await c.env.LINKS.put(data.id, JSON.stringify(data))

  return c.redirect(data.url, 302)
})

export default app
