import express from "express";
import {
  createShopAdmin,
  getShops,
  loginUsers,
  editShop,
  deleteShop,
} from "../controllers/userController.js";
import { addSuperAdmin } from "../controllers/superAdminController.js";
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post("/super-admin", auth, addSuperAdmin);
router.post("/login", loginUsers);
router.post("/shop/createshop", auth, createShopAdmin);
router.get("/shop/getshop", auth, getShops);
router.put("/shop/editshop/:id", auth, editShop);
router.delete("/shop/deleteshop/:id", auth, deleteShop);

export default router;
