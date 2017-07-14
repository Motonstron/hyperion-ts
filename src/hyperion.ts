import * as events from "events";
import * as net from "net";

export class Hyperion extends events.EventEmitter {

  private socket: net.Socket;
  private isConnected: boolean;
  private dataBuffer: string = "";

  constructor(public address: string, public port: number, public priority: number) {
    super();
  }

  /**
   * Creates a new socket connection for the given address
   * in the config. Once connected emits a 'connect' event.
   */
  public connect(): void {
    this.socket = new net.Socket();
    this.socket.connect(this.port, this.address, () => {
      this.isConnected = true;
      this.emit("connect");
    });
  }

  /**
   * Set the color of the Hyperion Lights.
   *
   * @param color The color the lights should be set to.
   */
  public setColour(color: number[]): Promise<string> {
    const message: HyperionCommand = {
      color,
      command: "color",
      priority: this.priority,
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
  public setEffect(name: string, args?: any): Promise<string> {
    const message: HyperionCommand = {
      command: "effect",
      effect: {
        args,
        name,
      },
      priority: this.priority,
    };

    return this.sendMessage(message);
  }

  /**
   * Returns the information for the server.
   */
  public getServerInfo(): Promise<string> {
    const message: HyperionCommand = {
      command: "serverinfo",
    };

    return this.sendMessage(message);
  }

  /**
   * Clears the current effect/color.
   */
  public clear(): Promise<string> {
    const message: HyperionCommand = {
      command: "clearall",
    };

    return this.sendMessage(message);
  }

  /**
   * Returns if the socket is connected.
   */
  public get connected(): boolean {
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

          let parsedResponse: string;

          if (response.length === 0) {
            resolve("");
          }

          try {
            parsedResponse = JSON.parse(response);
          } catch (err) {
            reject("Error parsing data");
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

      this.socket.once("data", (data: any) => {
        this.cleanUp();
        this.parseData(data).then((value: string) => {
          resolve(value);
        }).catch((err: any) => {
          reject(err);
        });
      });
      this.socket.once("error", (err: any) => {
        this.cleanUp();
        reject("Error: Something went wrong...");
      });
      this.socket.on("end", () => this.cleanUp());
      this.socket.write(JSON.stringify(message) + "\n");
    });

  }

}
