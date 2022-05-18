import multer from 'multer'

export const notFoundError = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({ status: 'error', message: err.message })
  }
}
export const unauthorizedErrorHandler = (err, req, res, next) => {
  if (err.status === 401) {
    res.status(401).send({ status: 'error', message: err.message })
  }
}
export const genericErrorHandler = () => {
  console.log('ERROR: ', err)
  res.status(500).send({ message: 'Generic Server Error!' })
}
// export const badRequestErrorHandler = (err, req, res, next) => {
//   if (err.status === 400) {
//     res.status(400).send({
//       status: 'error',
//       message: err.message,
//       errorsList: err.errorsList
//     })
//   }
// }
