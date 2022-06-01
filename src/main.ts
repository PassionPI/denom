import { createServer } from "./utils/server.ts";
import { jsonData } from "./utils/parse.ts";
import { ERR_RESPONSE_JSON_PARSE } from "./error/response.ts";
import { defaultServerConfig } from "./config/server.ts";
import { nest } from "./utils/nest.ts";

const serverConfig = defaultServerConfig();

const { server } = createServer(serverConfig);
const { on, use, callback } = nest<{ a: 1 }>();

on("error", ({ err, request }) => {
  console.log("Error!", "\n", request.url, "\n", err);
});

use(async ({ url }, next) => {
  const st = Date.now();
  await next();
  const et = Date.now();
  console.log("Time Cost", url.pathname, et - st);
});

use(async ({ request, response, url }) => {
  const { method } = request;
  const { search, pathname } = url;

  const [err, data] = await jsonData<{ a: 1 }>(request);

  if (err) {
    return response(ERR_RESPONSE_JSON_PARSE());
  }

  response(
    new Response(
      JSON.stringify(
        {
          method,
          pathname: pathname.split("/"),
          search,
          data,
        },
        null,
        4
      )
    )
  );
});

await server(callback);
