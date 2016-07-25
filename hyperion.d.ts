declare module "hyperion" {

  import net = require("net");
  import util = require("util");
  import events = require("events");

  class Server extends events.EventEmitter {
    constructor(address: string, port: number, priority: number);

    connect(): void;

    parseData(data: string): Promise<string>;

    sendMessage(message: Object): Promise<string>;

    setColor(color: number[]): Promise<string>;

    setEffect(name: string, args?: Object): Promise<string>;

    clear(): Promise<string>;

    clearAll(): Promise<string>;

    getServerInfo(): Promise<string>;

    close(): void;
  }
}

interface HyperionConfig {
  address: string;
  port: number;
  priority: number;
}

interface HyperionCommand {
  command: string;
  priority?: number;
  effect?: HyperionEffect;
  color?: number[];
}

interface HyperionEffect {
  name: string;
  args: any;
}
