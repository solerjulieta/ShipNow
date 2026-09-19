import UserService from '../services/user.service.js'
import { HTTP_STATUS } from '../constants/index.js'

const userService = new UserService()

export const getUsers = async (req, res, next) => {
    try {
        const users = await userService.findAll(req.query)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: users })
    } catch (error) {
        next(error)
    }
}

export const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.uid)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: user })
    } catch (error) {
        next(error)
    }
}

export const createUser = async (req, res, next) => {
    try {
        const user = await userService.create(req.body)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: user })
    } catch (error) {
        next(error)
    }
}

export const updateUser = async (req, res, next) => {
    try {
        const user = await userService.update(req.params.uid, req.body)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: user })
    } catch (error) {
        next(error)
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const user = await userService.delete(req.params.uid)
        res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Usuario eliminado con éxito.' })
    } catch (error) {
        next(error)
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await userService.login(email, password)
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: user })
    } catch (error) {
        next(error)
    }
}