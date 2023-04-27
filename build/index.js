import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import apiRouter from './src/routes/api.js';
dotenv.config();
const MONGODB_URL = process.env.MONGO_URL || '';
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', '*');
    next();
});
const port = process.env.PORT;
// Database Connection
mongoose.set('strictQuery', false);
mongoose
    .connect(MONGODB_URL)
    .then(() => {
    //don't show the log when it is test
    // if (process.env.NODE_ENV !== 'test') {
    console.log('Connected to %s', MONGODB_URL);
    console.log('App is running ... \n');
    console.log('Press CTRL + C to stop the process. \n');
    // }
})
    .catch((err) => {
    console.error('App starting error:', err.message);
    process.exit(1);
});
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.use('/api', apiRouter);
app.listen(port, () => {
    console.log(`[server]: Server is running at PORT:${port}`);
});
