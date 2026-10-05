import ProductRepository from '../repositories/product.repository.js'
import { ValidationError, ProductNotFoundError, InsufficientStockError } from '../errors/index.js'
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
            throw new ProductNotFoundError(id)
        }

        return product
    }

    async create(productData){
        const { name, price, category } = productData

        if(!name || price === undefined || !category){
            throw new ValidationError('Falta información requerida.', {
                required: ['name', 'price', 'category']
            })
        }

        if(price < 0){
            throw new ValidationError('El precio no puede ser negativo.', { field: 'price', value: price })
        }

        const stock = Number(productData.stock ?? 0)

        if(stock < 0){
            throw new ValidationError('El stock no puede ser negativo.', { field: 'stock', value: stock })
        }

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

        if(nextStock < 0){
            throw new ValidationError('El stock no puede ser negativo.', { field: 'stock', value: nextStock })
        }
        
        if(productData.price !== undefined && productData.price < 0){
            throw new ValidationError('El precio no puede ser negativo.', { field: 'price', value: productData.price })
        }

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
            throw new ValidationError('La cantidad debe ser un entero mayor a cero.', { field: 'quantity', value: quantity })
        }

        await this.getProductById(id)

        const updated = await this.productRepository.decreaseStock(id, quantity)

        if(!updated){
            throw new InsufficientStockError()
        }

        if(updated.stock === 0 && updated.status === PRODUCT_STATUS.AVAILABLE){
            return this.productRepository.update(id, { status: PRODUCT_STATUS.OUT_OF_STOCK })
        }

        return updated
    }
}

export default ProductService
