import dotenv from "dotenv";
// dotenv.config({ path: '.env.local' });
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

console.log(process.env.NODE_ENV);

import express, { Request, Response } from "express";
import sequelize from "./util/dbConn";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as path from "path";
import helmet from "helmet";


import errorMiddleware from "./middleware/error";
import setInterface from "./middleware/interface";
import logging from "./middleware/logging";


const app = express();

app.use(express.json({ limit: '2450mb' }));

app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000",  // Local
  "http://localhost:5000",  // Local Backend
];


//X-FRAME and CSP Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Restrict everything to the same origin
        scriptSrc: ["'self'", ...allowedOrigins], // Allow scripts only from self and trusted CDN
        styleSrc: ["'self'", ...allowedOrigins], // Allow CSS from self and Google Fonts
        imgSrc: ["'self'", "data:", "blob:", ...allowedOrigins], // Allow images from self and trusted sources
        connectSrc: ["'self'", ...allowedOrigins], // Restrict API calls to trusted sources
        frameAncestors: ["'none'"], // Prevent site embedding in iframes
      },
    },
    frameguard: { action: "sameorigin" }, // Prevent Clickjacking
    xssFilter: true, // Enable XSS Protection
    noSniff: true, // Prevent MIME-type sniffing
    ieNoOpen: true, // Block file downloads in IE
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // Enforce HTTPS
    hidePoweredBy: true, // Hide "X-Powered-By: Express"
  })
);

//CORS POLICY APPLIED
var corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use((req, res, next) => {
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      return res
      .status(403)
      .json({ success: false, data: null, error: { code: 'ERR_CORS_NOT_ALLOWED' } });
    }
    next();
  });
});

app.use("/file",(req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // Allow cross-origin resource sharing
    next();
});

app.use(setInterface);
app.use(cookieParser())
app.use(logging);

//check connection to database
const connectToDb = async () => {
  const data = await sequelize.sync({ force: false })
  try {
    await sequelize.authenticate();
      console.log("Database Connected successfully.");
      
      const used = process.memoryUsage();
      console.log(`Memory usage: ${JSON.stringify(used)}`);
    } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};





app.use(errorMiddleware);

app.listen(5000, () => {
  connectToDb();
  console.log(`[*] Server listening on Port ${5000}`);
});
