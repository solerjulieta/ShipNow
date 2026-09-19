import { Router } from 'express'
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login
} from '../controllers/user.controller.js'

const router = Router()

router.get('/', getUsers)
router.post('/login', login)
router.get('/:uid', getUserById)
router.post('/', createUser)
router.put('/:uid', updateUser)
router.delete('/:uid', deleteUser)

export default router