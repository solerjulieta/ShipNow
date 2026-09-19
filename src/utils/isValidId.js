import mongoose from 'mongoose'

export const isValidId = (id) => mongoose.isValidObjectId(id)

export default isValidId