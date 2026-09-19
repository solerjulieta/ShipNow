import bcrypt from 'bcryptjs'
import UserRepository from '../repositories/user.repository.js'
import AppError from '../utils/AppError.js'
import { USER_ROLES, HTTP_STATUS } from '../constants/index.js'

class UserService {
    constructor(){
        this.userRepository = new UserRepository()
    }

    async findAll(query = {}){
        const filter = {}
        if(query.role) filter.role = query.role

        return this.userRepository.findAll(filter)
    }

    async getUserById(id){
        const user = await this.userRepository.findById(id)

        if(!user){
            throw new AppError('El usuario no existe.', HTTP_STATUS.NOT_FOUND)
        }

        return user
    }

    async create(userData){
        const { firstName, lastName, email, password } = userData

        if(!firstName || !lastName || !email || !password){
            throw new AppError('Falta información requerida.', HTTP_STATUS.BAD_REQUEST)
        }

        if(password.length < 8){
            throw new AppError(
                'La contraseña debe tener al menos 8 caracteres.',
                HTTP_STATUS.BAD_REQUEST
            )
        }

        const existentUser = await this.userRepository.findByEmail(email)

        if(existentUser){
            throw new AppError('Ya existe un usuario con ese email.', HTTP_STATUS.CONFLICT)
        }

        // Si mandan un rol que no existe, cae en customer
        const role = Object.values(USER_ROLES).includes(userData.role)
            ? userData.role
            : USER_ROLES.CUSTOMER

        // La contraseña nunca se guarda en texto plano
        const hashedPassword = await bcrypt.hash(password, 10)

        return this.userRepository.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role
        })
    }

    async update(id, userData){
        await this.getUserById(id)

        const { email, password, ...allowedData } = userData

        if(email){
            const existentUser = await this.userRepository.findByEmail(email)

            // Si el email ya está tomado por OTRO usuario, error
            if(existentUser && existentUser._id.toString() !== id){
                throw new AppError('Ya existe un usuario con ese email.', HTTP_STATUS.CONFLICT)
            }

            allowedData.email = email
        }

        if(password){
            if(password.length < 8){
                throw new AppError(
                    'La contraseña debe tener al menos 8 caracteres.',
                    HTTP_STATUS.BAD_REQUEST
                )
            }
            allowedData.password = await bcrypt.hash(password, 10)
        }

        return this.userRepository.update(id, allowedData)
    }

    async delete(id){
        await this.getUserById(id)
        return this.userRepository.delete(id)
    }

    // Base para cuando agreguemos JWT en el próximo módulo
    async login(email, password){
        if(!email || !password){
            throw new AppError('Email y contraseña son requeridos.', HTTP_STATUS.BAD_REQUEST)
        }

        const user = await this.userRepository.findByEmailWithPassword(email)

        if(!user){
            throw new AppError('Email o contraseña incorrectos.', HTTP_STATUS.UNAUTHORIZED)
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if(!isValidPassword){
            throw new AppError('Email o contraseña incorrectos.', HTTP_STATUS.UNAUTHORIZED)
        }

        return this.userRepository.findById(user._id)
    }
}

export default UserService
