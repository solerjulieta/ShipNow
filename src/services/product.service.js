import ProductRepository from '../repositories/product.repository.js'
import AppError from '../utils/AppError.js'
import { PRODUCT_STATUS, HTTP_STATUS } from '../constants/index.js'

class ProductService {
    constructor(){
        this.productRepository = new ProductRepository()
    }

    // El status nunca se confía del body: se calcula a partir del stock
    #resolveStatus(stock, requestedStatus){
        if(requestedStatus === PRODUCT_STATUS.DISCONTINUED) return PRODUCT_STATUS.DISCONTINUED
        return stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK
    }

    async findAll(query = {}){
        const filter = {}
        if(query.category) filter.category = query.category

        // Por defecto, el listado público sólo muestra productos disponibles.
        // Si se pide explícitamente otro status (por ejemplo, desde un panel de administración), se respeta.
        filter.status = query.status ?? PRODUCT_STATUS.AVAILABLE

        return this.productRepository.findAll(filter)
    }

    async getProductById(id){
        const product = await this.productRepository.findById(id)

        if(!product){
            throw new AppError('El producto no existe.', HTTP_STATUS.NOT_FOUND)
        }

        return product
    }

    async create(productData){
        const { name, price, category } = productData

        if(!name || price === undefined || !category){
            throw new AppError('Falta información requerida.', HTTP_STATUS.BAD_REQUEST)
        }

        if(price < 0){
            throw new AppError('El precio no puede ser negativo.', HTTP_STATUS.BAD_REQUEST)
        }

        const stock = Number(productData.stock ?? 0)

        return this.productRepository.create({
            name,
            description: productData.description ?? '',
            price,
            stock,
            category,
            status: this.#resolveStatus(stock, productData.status)
        })
    }

    async update(id, productData){
        const current = await this.getProductById(id)

        const nextStock = productData.stock !== undefined ? Number(productData.stock) : current.stock

        return this.productRepository.update(id, {
            ...productData,
            stock: nextStock,
            status: this.#resolveStatus(nextStock, productData.status ?? current.status)
        })
    }

    async delete(id){
        await this.getProductById(id)
        return this.productRepository.delete(id)
    }

    // Reserva de stock: la va a usar OrderService cuando se cree una orden con productos reales
    async reserveStock(id, quantity){
        if(!Number.isInteger(quantity) || quantity <= 0){
            throw new AppError('La cantidad debe ser un entero mayor a cero.', HTTP_STATUS.BAD_REQUEST)
        }

        const product = await this.getProductById(id)

        const updated = await this.productRepository.decreaseStock(id, quantity)

        if(!updated){
            throw new AppError('No hay stock suficiente para completar la operación.', HTTP_STATUS.CONFLICT)
        }

        if(updated.stock === 0 && updated.status === PRODUCT_STATUS.AVAILABLE){
            return this.productRepository.update(id, { status: PRODUCT_STATUS.OUT_OF_STOCK })
        }

        return updated
    }
}

export default ProductService
