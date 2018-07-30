import * as Config from "config";
import * as Hapi from "hapi";
// import * as Joi from "joi";
import { HyperionConfig, HyperionCore } from "./hyperion-core";

export class HyperionServer {

  private server = new Hapi.Server();

  private hyperionConfig: HyperionConfig = Config.get("hyperion");

  private hyperion = new HyperionCore(this.hyperionConfig);

  private isActive = false;

  constructor() {
    this.server.connection({
      port: Config.get("server.port") as number,
    });
  }

  public connect(): void {
    this.server.start(async (serverError: Error) => {
      if (serverError) {
        throw serverError;
      }

      try {
        await this.hyperion.connect();
        console.info(`[Hyperion]: Connection Successful ${this.server.info.address}:${this.server.info.port}`);
        this.initialiseRoots();
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
          throw Error(`Hyperion info error: ${err}`);
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
          this.isActive = true;
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
          const data = await this.hyperion.initialiseColour([0, 0, 0]);
          reply({
            result: data,
          });
          this.isActive = false;
        } catch (err) {
          throw Error(`Hyperion off error: ${err}`);
        }
      },
      method: "GET",
      path: Config.get("hyperion.routes.off") as string,
    });

    this.server.route({
      handler: async (request: Hapi.Request, reply: Hapi.ReplyNoContinue) => {
        try {
          reply(Number(this.isActive));
        } catch (err) {
          throw Error(`Hyperion status error: ${err}`);
        }
      },
      method: "GET",
      path: Config.get("hyperion.routes.status") as string,
    });
  }
}

const hyperion: HyperionServer = new HyperionServer();
hyperion.connect();
