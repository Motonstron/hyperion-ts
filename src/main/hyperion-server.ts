import * as Config from "config";
import * as Hapi from "hapi";
import * as Joi from "joi";
import { HyperionConfig, HyperionCore } from "./hyperion-core";

export class HyperionServer {

  private server = new Hapi.Server();

  private hyperionConfig: HyperionConfig = Config.get("hyperion");

  private hyperion = new HyperionCore(this.hyperionConfig);

  constructor() {
    this.server.connection({
      port: Config.get("server.port") as string,
    });
    this.initialiseRoots();
  }

  public connect(): void {
    this.server.start(async (serverError: Error) => {
      if (serverError) {
        throw serverError;
      }

      try {
        await this.hyperion.connect();
        console.info(`[Hyperion]: Connection Successful ${this.server.info.address}:${this.server.info.port}`);
      } catch (err) {
        throw Error(`[Hyperion Server]: Unable to connect to Hyperion. ${err}`);
      }
    });
  }

  public get hapi(): Hapi.Server {
    return this.server;
  }

  public get core(): HyperionCore {
    return this.hyperion;
  }

  private initialiseRoots(): void {
    this.server.route({
      handler: async (request: Hapi.Request, reply: Hapi.ReplyNoContinue) => {
        this.hyperion.getServerInfo().then((data: string) => {
          reply({
            result: data,
          });
        }).catch((err: Error) => {
          throw Error(`Hyperion off error: ${err}`);
        });
      },
      method: "GET",
      path: Config.get("hyperion.routes.info") as string,
    });

    this.server.route({
      handler: async (request: Hapi.Request, reply: Hapi.ReplyNoContinue) => {
        try {
          const data = await this.hyperion.clear();
          reply({
            result: data
          });
        } catch (err) {
          throw Error(`Hyperion on error: ${err}`);

        }
      },
      method: "GET",
      path: Config.get("hyperion.routes.on") as string,
    });

    this.server.route({
      handler: async (request: Hapi.Request, reply: Hapi.ReplyNoContinue) => {
        try {
          const data = await this.hyperion.initialiseColour([0, 255, 255]);
          reply({
            result: data,
          });
        } catch (err) {
          throw Error(`Hyperion info error: ${err}`);
        }
      },
      method: "GET",
      path: Config.get("hyperion.routes.off") as string,
    });

    this.server.route({
      config: {
        handler: (request: Hapi.Request, reply: Hapi.ReplyNoContinue) => {

          const colour = [
            request.payload.red,
            request.payload.green,
            request.payload.blue
          ];

          this.hyperion.initialiseColour(colour).then((data: string) => {
            reply({
              result: data,
            });
          }).catch((err: Error) => {
            console.error("=====", err);
          });
        },
        validate: {
          payload: {
            blue: Joi.number().min(0).max(255).required(),
            green: Joi.number().min(0).max(255).required(),
            red: Joi.number().min(0).max(255).required()
          },
        },
      },
      method: "POST",
      path: "/hyperion-colour",
    });
  }
}

const hyperion: HyperionServer = new HyperionServer();
hyperion.connect();
