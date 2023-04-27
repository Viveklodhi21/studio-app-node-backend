import express from "express";
import { addshopUserData, deleteshopUser, editshopUser, getshopUsers, } from "../controllers/shopUserController.js";
import { auth } from '../middleware/auth.js';
const router = express.Router();
router.post("/addshopuser", auth, addshopUserData);
router.get("/getshopusers/:shopId", auth, getshopUsers);
router.put("/editshopuser/:id", auth, editshopUser);
router.delete("/deleteshopuser/:id", auth, deleteshopUser);
export default router;
