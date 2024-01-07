// eslint-disable-next-line simple-import-sort/imports
import "reflect-metadata";
import {
  CORS_ORIGINS,
  CREDENTIALS,
  DATABASE,
  MONGO_URI,
  PORT,
  jwtStrategy,
} from "./config";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import http from "http";
import mongoose from "mongoose";
import passport from "passport";
import { useExpressServer } from "routing-controllers";
import xss from "xss-clean";

import handlingErrorsMiddleware from "./middlewares/handlingErrors.middleware";

let serverConnection: http.Server;

export default class App {
  private app: Application;
  private port: string | number;
  private controllers: Function[] = [];

  constructor(controllers: Function[]) {
    this.app = express();
    this.port = PORT || 3000;
    this.controllers = controllers;

    this.initMiddlewares();
    this.initRoutes(controllers);

    this.initHandlingErrors();
  }

  private initMiddlewares() {
    this.app.use(cors({ origin: CORS_ORIGINS }));

    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.use(xss());
    this.app.use(cookieParser());

    this.app.use(passport.initialize());
    passport.use("jwt", jwtStrategy);
  }

  private initRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      cors: {
        origin: CORS_ORIGINS,
        credentials: CREDENTIALS,
      },
      routePrefix: "/api",
      controllers: controllers,
      defaultErrorHandler: false,
    });
  }

  private initHandlingErrors() {
    this.app.use(handlingErrorsMiddleware);
  }

  static async initDB() {
    await mongoose.connect(`${MONGO_URI}/${DATABASE}`);
  }

  static async closeDB() {
    await mongoose.disconnect();
  }

  public initWebServer = async () => {
    return new Promise((resolve) => {
      serverConnection = this.app.listen(this.port, () => {
        console.log(`Ready on port http://localhost:${this.port}`);

        resolve(serverConnection.address());
      });
    });
  };

  public initServerWithDB = async () => {
    await Promise.all([App.initDB(), this.initWebServer()]);
  };

  public stopWebServer = async () => {
    return new Promise((resolve) => {
      serverConnection.close(() => {
        resolve(void 0);
      });
    });
  };

  public getServer = () => {
    return this.app;
  };

  public get getControllers() {
    return this.controllers;
  }
}
