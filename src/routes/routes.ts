import { getLoginRoute } from "./auth/login.js";
import { createUserRoute } from "./users/createUser.js";
import { deleteUserRoute } from "./users/deleteUser.js";
import { getUserRoute } from "./users/getUser.js";
import { getMeRoute } from "./auth/me.js";
import { updateUserRoute } from "./users/updateUser.js";
import { updateUserPassword } from "./users/updateUserPassword.js";
import { getRefreshTokenRoute } from "./auth/refresh.js";
import { createDeviceRoute } from "./devices/createDevice.js";
import { getDeviceRoute } from "./devices/getDevice.js";
import { updateDeviceRoute } from "./devices/updateDevice.js";

export const registerRoutes = () => {
  getUserRoute();
  createUserRoute();
  updateUserPassword();
  updateUserRoute();
  deleteUserRoute();
  getMeRoute();
  getLoginRoute();
  getRefreshTokenRoute();
  createDeviceRoute();
  getDeviceRoute();
  updateDeviceRoute();
};
