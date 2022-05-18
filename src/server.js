import express from 'express'
import listEndpoints from 'express-list-endpoints'
import productsRouter from './apis/products/index.js'
import cors from 'cors'
import { join } from 'path'
import createError from 'http-errors'

const publicFolderPath = join(process.cwd(), './public')

const server = express()

const port = process.env.PORT || 5001

const whitelist = [process.env.BE_URL, 'https://m5-first-deploy.herokuapp.com/']
console.log(whitelist)
console.log(process.env.CLOUDINARY_URL)

// const corsOptions = {
// origin: (process.env.BE_URL, next) => {
//   console.log('CURRENT ORIGIN: ', origin)

//   if (!origin || whitelist.indexOf() !== -1) {
//     next(null, true)
//   } else {
//     next(
//       createError(
//         400,
//         `Cors Error! your origin ${origin} is not in the list!`
//       )
// )
// }
// }
// }

server.use(express.static(publicFolderPath))
server.use(cors())
server.use(express.json())

server.use('/products', productsRouter)

server.use(express.static(publicFolderPath))

server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log(`Server is listening on port ${port}`)
})
server.on('error', (error) => {
  console.log('new error', error)
})
