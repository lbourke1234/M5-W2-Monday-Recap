import express from 'express'
import {
  getProducts,
  writeProducts,
  getReviews,
  writeReviews
} from '../../lib/fs-tools.js'
import {
  checkProductsSchema,
  productsValidationResult,
  reviewsValidationResult,
  checkReviewsSchema
} from './validation.js'
import uniqid from 'uniqid'
import createError from 'http-errors'
import multer from 'multer'
import { saveProductsPicture } from '../../lib/fs-tools.js'

import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
// import 'dotenv/config'

const productsRouter = express.Router()
console.log('CLOUDINARY KEY: ', process.env.CLOUDINARY_SECRET)
const url = 'cloudinary://276264576986923:g3jyBN0i3HvakAYPBu0aP-LU-Vk@dmk6k0td1'
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'm5'
    }
  })
}).single('picture')

productsRouter.post(
  '/:productId/upload',
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      console.log('FILE: ', req.file)
      const products = await getProducts()
      const index = products.findIndex(
        (product) => product.id === req.params.productId
      )
      if (index !== -1) {
        const oldProduct = products[index]
        const updatedProduct = {
          ...oldProduct,
          imageUrl: req.file.path,
          updatedAt: new Date()
        }
        products[index] = updatedProduct
        await writeProducts(products)
        console.log(updatedProduct)
        console.log(req.file.path)
        console.log('iuhasidhaisd')
        res.send({ updatedProduct: updatedProduct })
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

productsRouter.post(
  '/',
  checkProductsSchema,
  productsValidationResult,
  async (req, res, next) => {
    try {
      console.log('req body: ', req.body)
      const newProduct = {
        ...req.body,
        createdAt: new Date(),
        id: uniqid()
      }
      console.log('new product: ', newProduct)
      const products = await getProducts()
      products.push(newProduct)
      await writeProducts(products)
      res.status(201).send({ id: newProduct.id })
    } catch (error) {
      next(error)
    }
  }
)

productsRouter.get('/', async (req, res, next) => {
  try {
    const products = await getProducts()
    console.log('products: ', products)
    res.send(products)
  } catch (error) {
    next(error)
  }
})

productsRouter.get('/:productId', async (req, res, next) => {
  try {
    const products = await getProducts()
    const foundProduct = products.find(
      (product) => product.id === req.params.productId
    )
    res.send(foundProduct)
  } catch (error) {
    next(error)
  }
})

productsRouter.put(
  '/:productId',
  checkProductsSchema,
  productsValidationResult,
  async (req, res, next) => {
    try {
      const products = await getProducts()
      const index = products.findIndex(
        (product) => product.id === req.params.productId
      )
      if (index !== -1) {
        const oldProduct = products[index]
        const updatedProduct = {
          ...oldProduct,
          ...req.body,
          updatedAt: new Date()
        }
        products[index] = updatedProduct
        await writeProducts(products)
        res.send(updatedProduct)
      }
    } catch (error) {
      next(error)
    }
  }
)

productsRouter.delete('/:productId', async (req, res, next) => {
  try {
    const products = await getProducts()
    const keptProducts = products.filter(
      (product) => product.id !== req.params.productId
    )
    await writeProducts(keptProducts)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// -----------REVIEW PRODUCTS CRUD ---------

productsRouter.post(
  '/:productId/reviews',
  /*   checkReviewsSchema,
  reviewsValidationResult, */
  async (req, res, next) => {
    try {
      const products = await getProducts()
      const newReview = {
        ...req.body,
        updatedAt: new Date(),
        reviewId: uniqid()
      }

      const findProduct = products.find(
        (product) => product.id === req.params.productId
      )
      if (findProduct) {
        findProduct.reviews.push(newReview)
        await writeProducts(products)
        res.send(newReview)
      }
    } catch (error) {
      next(error)
    }
  }
)

productsRouter.get('/:productId/reviews', async (req, res, next) => {
  try {
    const products = await getProducts()
    const findProduct = products.find(
      (product) => product.id === req.params.productId
    )
    res.send(findProduct.reviews)
  } catch (error) {
    next(error)
  }
})

productsRouter.get('/:productId/reviews/:reviewId', async (req, res, next) => {
  try {
    const products = await getProducts()
    const findProduct = products.find(
      (product) => product.id === req.params.productId
    )
    const findReview = findProduct.reviews.find(
      (review) => review.reviewId === req.params.reviewId
    )
    console.log('This is the Review:', findReview)
    console.log('This is the Product: ', findProduct)

    if (findProduct && findReview) {
      res.send(findReview)
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.put('/:productId/reviews/:reviewId', async (req, res, next) => {
  try {
    const products = await getProducts()
    const index = products.findIndex(
      (product) => product.id === req.params.productId
    )
    console.log('INDEX OF  :', index)

    const foundReview = products[index].reviews.find(
      (review) => review.reviewId === req.params.reviewId
    )

    if (foundReview) {
      const oldReview = products[index]

      const updatedReview = {
        ...oldReview,
        ...req.body,
        updatedAt: new Date()
      }
      console.log('INDEX OF old :', updatedReview)

      products[index].reviews = updatedReview
      await writeProducts(products)
      res.send(updatedReview)
    } else {
      next(createError(404, 'no review ID found'))
    }
    console.log('INDEX OF find:', foundReview)
  } catch (error) {
    next(error)
  }
})

productsRouter.delete(
  '/:productId/reviews/:reviewId',
  async (req, res, next) => {
    try {
      const products = await getProducts()

      const keptProducts = products.filter((product) =>
        console.log('product reviews: ', product.reviews)
      )

      console.log('kept products: ', keptProducts)

      //   const findReview = foundProduct.reviews.find(
      //     (review) => review.reviewId === req.params.reviewId
      //   );

      //   const remainingReview = foundProduct.reviews.filter(
      //     (review) => findReview.id !== review.reviews.reviewId
      //   );

      //   console.log("HERE IS THE REVIEW", remainingReview);

      //   await writeProducts(keptProducts)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
)

// productsRouter.post(
//   '/:productId/upload',
//   multer().single('picture'),
//   async (request, response, next) => {
//     try {
//       console.log('FILE:', request.file)
//       const url = await saveProductsPicture(
//         request.file.originalname,
//         request.file.buffer
//       )

//       const products = await getProducts()

//       const index = products.findIndex(
//         (post) => post.id === request.params.userId
//       )
//       if (index !== -1) {
//         const oldPost = products[index]
//         const updatedProducts = {
//           ...oldPost,
//           imageUrl: url,
//           updatedAt: new Date()
//         }
//         products[index] = updatedProducts
//         await writeProducts(products)
//         response.send(updatedProducts)
//       }
//     } catch (error) {
//       next(error)
//     }
//   }
// )

export default productsRouter
