import cors from 'cors'

export default function () {
  return cors({
    exposedHeaders: ['Link', 'Location'],
    allowedHeaders: ['Authorization', 'content-type', 'Prefer'],
    origin: true,
    credentials: true,
  })
}
