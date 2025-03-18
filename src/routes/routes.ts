import { getLoginRoute } from "./auth/login.js"
import { getUserRoute } from "./users/getUser.js"
import { getMeRoute } from "./auth/me.js"
import { getRefreshTokenRoute } from "./auth/refresh.js"
import { patchDeviceRoute } from "./devices/updateDevice.js"
import { getDeviceRoute } from "./devices/getDevice.js"
import { createDeviceRoute } from "./devices/createDevice.js"
import { getAllDeviceRoute } from "./devices/getAllDevices.js"
import { deleteDeviceRoute } from "./devices/deleteDevice.js"

export const registerRoutes = () => {
    getUserRoute()
    getMeRoute()
    getLoginRoute()
    getRefreshTokenRoute()
    patchDeviceRoute()
    getDeviceRoute()
    createDeviceRoute()
    getAllDeviceRoute()
    deleteDeviceRoute()
}