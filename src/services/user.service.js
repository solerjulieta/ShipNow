import bcrypt from 'bcryptjs'
import UserRepository from '../repositories/user.repository.js'
import { ValidationError, UserNotFoundError, DuplicateEmailError, InvalidCredentialsError } from '../errors/index.js'
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
            throw new UserNotFoundError(id)
        }

        return user
    }

    async create(userData){
        const { firstName, lastName, email, password } = userData

        if(!firstName || !lastName || !email || !password){
            throw new ValidationError('Falta información requerida.', {
                required: ['firstName', 'lastName', 'email', 'password']
            })
        }

        if(password.length < 8){
            throw new ValidationError('La contraseña debe tener al menos 8 caracteres.')
        }

        const existentUser = await this.userRepository.findByEmail(email)

        if(existentUser){
            throw new DuplicateEmailError(email)
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
                throw new DuplicateEmailError(email)
            }

            allowedData.email = email
        }

        if(password){
            if(password.length < 8){
                throw new ValidationError('La contraseña debe tener al menos 8 caracteres.')
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
            throw new ValidationError('Email y contraseña son requeridos.', {
                required: ['email', 'password']
            })
        }

        const user = await this.userRepository.findByEmailWithPassword(email)

        if(!user){
            throw new InvalidCredentialsError()
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if(!isValidPassword){
            throw new InvalidCredentialsError()
        }

        return this.userRepository.findById(user._id)
    }
}

export default UserService
