import * as Hapi from "hapi";

const server = new Hapi.Server();
// const hyperion = new Hyperion.("localhost", 3000, 1000);

server.connection({
  host: "localhost",
  port: 3000,
});

server.start((err: Error) => {

  if (err) {
    throw err;
  }

  console.log(`Server running at: ${server.info.uri}`);

});
