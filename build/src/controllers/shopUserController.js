import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { errorResponse, successResponse, validationError } from '../helpers/api-response.js';
import ShopUser from '../models/shopUserSchema.js';
import { generatePassword, sendEmail, uploadToCloudinary } from '../helpers/utils.js';
export const addshopUserData = async (req, res) => {
    const { shopId, shopUserName, shopUserEmail, shopUserAddress, shopUserCity, shopUserPhone, status, role } = req.body;
    try {
        const profilePicture = req.files?.profilePicture ? req.files?.profilePicture : null;
        console.log('profilePicture', profilePicture);
        const uploadImage = profilePicture ? await uploadToCloudinary(profilePicture) : null;
        const shopUserData = {
            shopId,
            profilePicture: uploadImage,
            shopUserName,
            shopUserEmail,
            shopUserAddress,
            shopUserCity,
            shopUserPhone,
            status,
            role
        };
        const data = new ShopUser(shopUserData);
        const userExists = await ShopUser.findOne({ shopUserEmail });
        if (userExists) {
            return errorResponse(res, 'User with this email already exists');
        }
        const password = generatePassword();
        const shopUserData1 = {
            shopUserName,
            shopUserEmail,
            password
        };
        console.log('geneeratee password', shopUserData1);
        await sendEmail(shopUserEmail, 'Greetings!', shopUserData1);
        const jwtPayload = data;
        let token = jwt.sign(jwtPayload.toJSON(), 'secret key');
        const response = { ...data._doc, token };
        const salt = await bcrypt.genSalt(7);
        data.password = await bcrypt.hash(String(password), salt);
        await data.save();
        data.password = undefined;
        data.__v = undefined;
        return successResponse(res, 'Shop User added successfully', response);
    }
    catch (error) {
        console.log('errorrr', error);
        return errorResponse(res, error.message);
    }
};
export const getshopUsers = async (req, res) => {
    try {
        const per_page = parseInt(req.query.per_page);
        const current_page = parseInt(req.query.current_page);
        const shopUsers = await ShopUser.find()
            .limit(per_page)
            .skip((current_page - 1) * per_page);
        const numOfShopUsers = await ShopUser.count();
        return successResponse(res, 'ShopUser  found successfully', {
            shopUsers,
            current_page,
            total_pages: Math.ceil(numOfShopUsers / per_page),
            total_entries: numOfShopUsers
        });
    }
    catch (error) {
        validationError(res, error.message);
    }
};
export const editshopUser = async (req, res) => {
    const { shopUserName, shopUserEmail, shopUserAddress, shopUserCity, shopUserPhone, status } = req.body;
    const profilePicture = req.files?.profilePicture ? req.files?.profilePicture : null;
    console.log('profilePicture', profilePicture);
    const uploadImage = profilePicture ? await uploadToCloudinary(profilePicture) : null;
    const userData = {
        profilePicture: uploadImage,
        shopUserName,
        shopUserEmail,
        shopUserAddress,
        shopUserCity,
        shopUserPhone,
        status
    };
    try {
        await ShopUser.findByIdAndUpdate(req.params.id, userData);
        successResponse(res, 'Shop updated successfully', '');
    }
    catch (error) {
        validationError(res, error.message);
    }
};
export const deleteshopUser = async (req, res) => {
    try {
        await ShopUser.findOneAndDelete({ _id: req.params.id });
        successResponse(res, 'shopUser deleted successfully', '');
    }
    catch (error) {
        validationError(res, error.message);
    }
};
