export const USER_ROLES = Object.freeze({
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    DRIVER: 'driver',
    STORE: 'store'
})

export const DELIVERY_STATUS = Object.freeze({
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered'
})

export const DELIVERY_PRIORITY = Object.freeze({
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high'
})

// Transiciones permitidas: desde cada estado, a cuáles se puede pasar
export const ALLOWED_STATUS_TRANSITIONS = Object.freeze({
    [DELIVERY_STATUS.PENDING]: [DELIVERY_STATUS.ASSIGNED],
    [DELIVERY_STATUS.ASSIGNED]: [DELIVERY_STATUS.IN_TRANSIT],
    [DELIVERY_STATUS.IN_TRANSIT]: [DELIVERY_STATUS.DELIVERED],
    [DELIVERY_STATUS.DELIVERED]: []    
})

export const HTTP_STATUS = Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500
})