// @ts-nocheck
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
import cloudinary from 'cloudinary';
import pdfmake from 'pdfmake';
import moment from 'moment';
import fs from 'fs';
import twilio from 'twilio';
import path from 'path';
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const getUserId = (req: Request) => {
  let decoded: any;
  const secret = process.env.JWT_SECRET || 'secret';
  let token = req.headers.authorization?.split(' ')[1] || '';

  decoded = jwt.verify(token, secret);
  return decoded._id;
};

const uploadToCloudinary = async (image: any) => {
  const result = await cloudinary.v2.uploader.upload(image.tempFilePath, {
    resource_type: 'auto',
    folder: 'studio-app',
  });
  return result.secure_url;
};

const generatePassword = () => {
  let password = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i++) {
    password += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  console.log('possible', possible);
  return password;
};

const sendEmail = async (to: string, subject: string, user: any) => {
  console.log('email details', to, subject, user);

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const tempFilePath = path.join(__dirname, '../views/welcome.ejs');
    const userName = user.shopOwnerName ? user.shopOwnerName : user.shopUserName;
    const userEmail = user.shopEmail ? user.shopEmail : user.shopUserEmail;
    const template = await ejs.renderFile(tempFilePath, {
      name: userName,
      email: userEmail,
      password: user.password,
    });

    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: to,
      subject: `Welcome ${userName} to the Studio`,
      text: 'Get you username and password inside the mailbox',
      html: template,
    };

    await transporter.sendMail(mailOptions);
    console.log('email sent successfully');
  } catch (error) {
    console.log('error', error);
  }
};

const sendNewPasswordEmail = async (to: string, subject: string, user: any) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_SMTP_HOST,
    // port: process.env.EMAIL_SMTP_PORT,
    // secure: process.env.EMAIL_SMTP_SECURE, // lack of ssl commented this. You can uncomment it.
    service: 'gmail',
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const tempFilePath = path.join(__dirname, '../views/password.ejs');
  const template = await ejs.renderFile(tempFilePath, {
    name: user.name,
    password: user.password,
  });

  return transporter.sendMail({
    from: process.env.SMTP_MAIL,
    to: to,
    subject: subject,
    html: template,
  });
};

// Function to generate invoice pdf from the order data
const generateInvoice = async (invoiceData: any) => {
  const documentDefinition = {
    info: {
      title: `Studio Invoice`,
      author: 'Mayora Studio',
      subject: `Studio Invoice`,
    },
    content: [
      { text: 'INVOICE', style: 'header' },
      // {
      //   image: `${invoiceData.shopLogo}`,
      //   width: 150,
      //   alignment: 'center',
      // },
      { text: `Invoice ID: ${invoiceData._id}`, style: 'row' },
      {
        text: `Invoice Date: ${moment(invoiceData.createdAt).format('MMMM D, YYYY')}`,
        style: 'row',
      },
      { text: `Customer Name: ${invoiceData.customerName}`, style: 'row' },
      { text: `Customer Email: ${invoiceData.customerEmail}`, style: 'row' },
      { text: `Customer Phone: ${invoiceData.customerPhone}`, style: 'row' },
      { text: `Customer Address: ${invoiceData.customerAddress}`, style: 'row' },
      { text: '\n' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Item Name', bold: true },
              { text: 'Quantity', bold: true },
              { text: 'Original Price', bold: true },
              { text: 'Display Price', bold: true },
              { text: 'Discount', bold: true },
              { text: 'CGST', bold: true },
              { text: 'SGST', bold: true },
            ],
            ...invoiceData.orderDetails.map((item: any) => [
              item.itemName,
              item.quantity,
              item.originalPrice,
              item.displayPrice,
              item.discount,
              item.cgst,
              item.sgst,
            ]),
          ],
        },
      },
      { text: '\n' },
      { text: `Grand Total: ${invoiceData.grandTotal}`, style: 'row' },
      { text: `Discount On Total: ${invoiceData.discountOnTotal}`, style: 'row' },
      { text: `Final Amount: ${invoiceData.finalAmount}`, style: 'row' },
      { text: `Advance Payment: ${invoiceData.advancePayment}`, style: 'row' },
      { text: `Remaining Payment: ${invoiceData.remainingPayment}`, style: 'row' },
      { text: `Payment Mode: ${invoiceData.paymentMode}`, style: 'row' },
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        alignment: 'center',
        marginBottom: 20,
      },
      row: {
        margin: [5, 5, 5, 5],
      },
      total: {
        fontSize: 18,
        bold: true,
        alignment: 'right',
        margin: [0, 30, 0, 0],
      },
    },
  };

  let fonts = {
    Roboto: {
      normal: 'Courier',
      bold: 'Courier-Bold',
      italics: 'Courier-Oblique',
      bolditalics: 'Courier-BoldOblique',
    },
  };

  const pdfmakes = new pdfmake(fonts);
  const doc = pdfmakes.createPdfKitDocument(documentDefinition, {});
  // console.log('doc', doc);
  doc.pipe(fs.createWriteStream(`invoice.pdf`));
  // pdfDoc.pipe(fs.createWriteStream(`invoice-${invoiceData.invoiceNumber}.pdf`));

  // send whatsapp message to customer using twilio
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  client.messages
    .create({
      body: `Hi ${invoiceData.customerName}, Your invoice is ready. Please check your email for the invoice.`,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:+91${invoiceData.customerPhone}`,
      mediaUrl: 'https://i.pinimg.com/736x/ce/56/99/ce5699233cbc0f142250b520d967dff7.jpg',
    })
    .then((message: any) => console.log(message.sid))
    .catch((err: any) => console.log(err));

  return doc.end();
};

export {
  getUserId,
  generatePassword,
  sendEmail,
  // uploadToS3,
  // sendExamLink,
  sendNewPasswordEmail,
  uploadToCloudinary,
  generateInvoice,
};
