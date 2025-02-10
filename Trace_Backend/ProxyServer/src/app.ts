import express, { Express } from "express";
import config from "./config/config";
import { morgan } from './module/logger';
import helmet from "helmet";
import cors from "cors";
// import xss from 'xss-clean';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import passport from 'passport';
// import httpStatus from 'http-status';
import { authLimiter } from "./util";
import routes from "./routes";
import Data from "./module/scrapper/scrapper.module";
// import swaggerUi from "swagger-ui-express";
// import swaggerOutput from "./swagger_output.json";

const app: Express = express();

if (config.env != "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(helmet())

const corsOptions = {
  origin: [
    'http://localhost',
    'http://localhost:5173',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

// enable cors
app.use(cors(corsOptions));
app.options('*', cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
// app.use(xss());
app.use(ExpressMongoSanitize());

// gzip compression
app.use(compression());

// jwt authentication
app.use(passport.initialize());

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}
app.use('/', routes);



export default app;

const fs = require('fs');
const mongoose = require('mongoose');

// Define the Mongoose schema

// Connect to the MongoDB database
const connectToDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mydatabase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Read JSON file and write to the database
const writeFileToDatabase = async (filePath:string) => {
  try {
    // Read file
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    // Extract the keyword from the filename (without extension)
    const keyword = filePath ? filePath.split('/').pop()?.split('.')[0] : '';

    // Write each object to the database
    for (const obj of jsonData.objects) {
      const document = new Data({
        keyword,
        platform: "telegram", // Assuming "platform" is the type prefix
        results: obj,
      });

      await document.save();
      console.log("Saved document for keyword: ${keyword}");
    }
  } catch (error) {
    console.error('Error processing file:', error);
  }
};

// Main function
(async () => {
  await connectToDB();

  const filePath = './telegram/Bath Salts/Blue Magic.json'; // Replace with your JSON file path
  await writeFileToDatabase(filePath);

  mongoose.connection.close();
})();