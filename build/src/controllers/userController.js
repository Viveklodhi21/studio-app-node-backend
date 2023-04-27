import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { errorResponse, notFoundResponse, successResponse, unauthorizedResponse, validationError, } from '../helpers/api-response.js';
import { generatePassword, sendEmail, uploadToCloudinary } from '../helpers/utils.js';
import Shop from '../models/shopSchema.js';
import ShopUser from '../models/shopUserSchema.js';
export const loginUsers = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        let userData;
        if (role === 'user') {
            userData = await ShopUser.findOne({
                shopUserEmail: email,
                role,
            });
        }
        else if (role === 'admin') {
            userData = await Shop.findOne({
                shopEmail: email,
                role,
            });
        }
        else {
            userData = await User.findOne({
                email,
                role,
            });
        }
        if (!userData) {
            return notFoundResponse(res, 'User not found');
        }
        const isMatchPassword = await bcrypt.compare(password, userData.password);
        console.log('password', isMatchPassword);
        if (!isMatchPassword) {
            return unauthorizedResponse(res, 'Invalid Credentials');
        }
        const jwtPayload = userData;
        let token = jwt.sign(jwtPayload.toJSON(), 'secret key');
        userData.password = undefined;
        userData.__v = undefined;
        const response = { ...userData._doc, token };
        return successResponse(res, 'login successfully', response);
    }
    catch (error) {
        return errorResponse(res, error.message);
    }
};
export const createShopAdmin = async (req, res) => {
    const { userId, shopName, shopOwnerName, shopEmail, shopAddress, shopCity, shopPhone, role } = req.body;
    const shopLogo = req.files?.shopLogo ? req.files?.shopLogo : null;
    const uploadImage = shopLogo ? await uploadToCloudinary(shopLogo) : null;
    const userData = {
        userId,
        shopLogo: uploadImage,
        shopName,
        shopOwnerName,
        shopEmail,
        shopAddress,
        shopCity,
        shopPhone,
        role,
    };
    try {
        const data = new Shop(userData);
        // const admin = await Shop.findOne({ _id: userId }).populate('companyId');
        // if (!admin) {
        //   return errorResponse(res, 'Admin not found in the database');
        // }
        const shopExists = await Shop.findOne({ companyEmail: shopEmail });
        if (shopExists) {
            return errorResponse(res, 'Company with this email already exists');
        }
        const userExists = await User.findOne({ shopEmail });
        if (userExists) {
            return errorResponse(res, 'User with this email already exists');
        }
        const password = generatePassword();
        const userData1 = {
            shopOwnerName,
            shopEmail,
            password,
        };
        console.log('geneeratee password', userData1);
        await sendEmail(shopEmail, 'Greetings!', userData1);
        const jwtPayload = data;
        let token = jwt.sign(jwtPayload.toJSON(), 'secret key');
        const response = { ...data._doc, token };
        const salt = await bcrypt.genSalt(7);
        data.password = await bcrypt.hash(String(password), salt);
        await data.save();
        data.password = undefined;
        data.__v = undefined;
        successResponse(res, 'Shop added successfully', response);
    }
    catch (error) {
        validationError(res, error.message);
    }
};
export const getShops = async (req, res) => {
    try {
        const per_page = parseInt(req.query.per_page);
        const current_page = parseInt(req.query.current_page);
        const shops = await Shop.find()
            .limit(per_page)
            .skip((current_page - 1) * per_page);
        const numOfShops = await Shop.count();
        return successResponse(res, 'Shop found successfully', {
            shops,
            current_page,
            total_pages: Math.ceil(numOfShops / per_page),
            total_entries: numOfShops,
        });
    }
    catch (error) {
        return validationError(res, error.message);
    }
};
export const editShop = async (req, res) => {
    const { userId, shopName, shopOwnerName, shopEmail, shopAddress, shopCity, shopPhone, role, } = req.body;
    const shopLogo = req.files?.shopLogo ? req.files?.shopLogo : null;
    const uploadImage = shopLogo ? await uploadToCloudinary(shopLogo) : null;
    const userData = {
        userId,
        shopLogo: uploadImage,
        shopName,
        shopOwnerName,
        shopEmail,
        shopAddress,
        shopCity,
        shopPhone,
        role,
    };
    try {
        const shopExists = await Shop.findOne({ _id: req.params.id });
        if (!shopExists) {
            validationError(res, 'Shop with this ID not found in the database');
        }
        const shop = await Shop.findByIdAndUpdate(req.params.id, userData, { new: true });
        successResponse(res, 'Shop updated successfully', shop);
    }
    catch (error) {
        errorResponse(res, error.message);
    }
};
export const deleteShop = async (req, res) => {
    try {
        const shopExists = await Shop.findOne({ _id: req.params.id });
        if (!shopExists) {
            validationError(res, 'Shop with this ID not found in the database');
        }
        await Shop.findOneAndDelete({ _id: req.params.id });
        successResponse(res, 'Shop deleted successfully', null);
    }
    catch (error) {
        errorResponse(res, error.message);
    }
};
