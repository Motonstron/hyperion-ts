import * as events from "events";
import * as net from "net";

export enum CommandType {
  Info = "serverinfo",
  Clear = "clearall",
  Color = "color",
  Effect = "effect",
}

export interface HyperionConfig {
  address: string;
  port: number;
  priority: number;
}

export interface HyperionCommand {
  command: string;
  priority?: number;
  effect?: HyperionEffect;
  color?: number[];
}

export interface HyperionEffect {
  name: string;
  args: any;
}

export class HyperionCore extends events.EventEmitter {

  private socket: net.Socket;

  private isConnected: boolean;

  private dataBuffer: string = "";

  private priority: number;

  constructor(public config: HyperionConfig) {
    super();
    this.priority = Number(this.config.priority) || 1000;
  }

  /**
   * Creates a new socket connection for the given address
   * in the config. Once connected emits a 'connect' event.
   */
  public async connect(): Promise<any> {
    this.socket = new net.Socket();
    this.socket.setEncoding("utf8");
    this.socket.connect(this.config.port, this.config.address);

    return new Promise((resolve: () => void, reject: (err: Error) => void) => {
      this.socket.on("connect", () => {
        this.isConnected = true;
        resolve();
      });
      this.socket.on("error", (err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * Set the color of the Hyperion Lights.
   *
   * @param color The color the lights should be set to.
   */
  public initialiseColour(color: number[]): Promise<string> {
    const message: HyperionCommand = {
      color,
      command: CommandType.Color,
      priority: this.priority
    };

    return this.sendMessage(message);
  }

  /**
   * Allows the lights to display an effect, you can find effects
   * here: https://github.com/hyperion-project/hyperion/tree/master/effects.
   *
   * @param name The name of the effect
   * @param args The arguments for the effect.
   */
  public initialiseEffect(name: string, args?: any): Promise<string> {
    const message: HyperionCommand = {
      command: CommandType.Effect,
      effect: {
        args,
        name,
      },
      priority: this.priority
    };

    return this.sendMessage(message);
  }

  /**
   * Returns the information for the server.
   */
  public async getServerInfo(): Promise<string> {
    const message: HyperionCommand = {
      command: CommandType.Info,
    };

    return this.sendMessage(message);
  }

  /**
   * Clears the current effect/color.
   */
  public async clear(): Promise<string> {
    const message: HyperionCommand = {
      command: CommandType.Clear,
    };

    return this.sendMessage(message);
  }

  /**
   * Returns if the socket is connected.
   */
  public get getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnects the socket connection.
   */
  public disconnect(): void {
    this.isConnected = false;
    this.socket.end();
  }

  /**
   * Parses the data from the socket connection.
   *
   * @param data
   */
  private parseData(data: string): Promise<string> {
    this.dataBuffer += data;
    return new Promise<string>((resolve: any, reject: any) => {
      if (this.dataBuffer.indexOf("\n") > -1) {
        this.dataBuffer.split("\n").forEach((response: string, i: number) => {
          if (response.length === 0) {
            resolve("");
            return;
          }

          let parsedResponse: string;
          try {
            parsedResponse = JSON.parse(response);
          } catch (err) {
            // console.error("Error", err);
          }

          resolve(parsedResponse);
        });
      }
    });
  }

  /**
   * Cleans up the listeners from the socket connection.
   */
  private cleanUp(): void {
    this.dataBuffer = "";
    this.socket.removeAllListeners();
  }

  /**
   * Sends the specified message/command to the socket connection, returns
   * a success or error if something went wrong.
   *
   * @param message
   */
  private sendMessage(message: HyperionCommand): Promise<string> {
    return new Promise<string>((resolve: any, reject: any) => {
      this.socket.on("data", (data: any) => {
        this.parseData(data).then((value: string) => {
          resolve(value);
          this.cleanUp();
        });
      });
      this.socket.on("error", (err: Error) => {
        reject("Error: Something went wrong...", err);
        this.cleanUp();
      });
      this.socket.write(JSON.stringify(message) + "\n");
    });

  }

}
