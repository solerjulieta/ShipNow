import { isValidId } from '../utils/isValidId.js'
import Product from '../models/product.model.js'

export default class ProductRepository {
    // Filtro base: por defecto, nadie ve productos discontinuados salvo que se pidan explícitamente
    #buildQuery(filter = {}){
        const query = { ...filter }
        if(query.category) query.category = query.category.toLowerCase()
        return query
    }

    async findAll(filter = {}){
        return Product.find(this.#buildQuery(filter)).sort({ createdAt: -1 })
    }

    async findById(id){
        if(!isValidId(id)) return null
        return Product.findById(id)
    }

    async create(productData){
        return Product.create(productData)
    }

    async update(id, productData){
        if(!isValidId(id)) return null
        return Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true })
    }

    async delete(id){
        if(!isValidId(id)) return null
        return Product.findByIdAndDelete(id)
    }

    // Descuento atómico: sólo resta si hay stock suficiente
    async decreaseStock(id, quantity){
        if(!isValidId(id)) return null
        return Product.findOneAndUpdate(
            { _id: id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        )
    }
}