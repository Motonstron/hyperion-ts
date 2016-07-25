"use strict";

import * as net from "net";
import * as events from "events";

export class Server extends events.EventEmitter {

  private socket: net.Socket;
  private isConnected: boolean;
  private dataBuffer: string = "";

  constructor(public address: string, public port: number, public priority: number) {
    super();
  }

  public connect(): void {

    this.socket = new net.Socket();
    this.socket.connect(this.port, this.address, () => {

      this.isConnected = true;
      this.emit("connect");

    });
  }

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

  private cleanUp(): void {
    this.socket.removeAllListeners();
  }

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

  public setColour(color: number[]): Promise<string> {
    let message: HyperionCommand = {
      command: "color",
      priority: this.priority,
      color: color
    };

    return this.sendMessage(message);
  }

  public setEffect(name: string, args?: any): Promise<string> {
    let message: HyperionCommand = {
      command: "effect",
      priority: this.priority,
      effect: {
        name: name,
        args: args
      }
    };

    return this.sendMessage(message);
  }

  public getServerInfo(): Promise<string> {
    let message: HyperionCommand = {
      command: "serverinfo"
    };

    return this.sendMessage(message);
  }

  public clear(): Promise<string> {
    let message: HyperionCommand = {
      command: "clearall"
    };

    return this.sendMessage(message);
  }

  public close(): void {
    this.isConnected = false;
    this.socket.end();
  }

  get connected(): boolean {
    return this.isConnected;
  }

};
