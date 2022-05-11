import { createServer } from "./utils/server.ts";
import { jsonData } from "./utils/parse.ts";
import { ERR_RESPONSE_JSON_PARSE } from "./error/response.ts";
import { defaultServerConfig } from "./config/server.ts";
import { nest } from "./utils/nest.ts";

const serverConfig = defaultServerConfig();

const { on, use, callback } = nest<{ a: 1 }>();

on("error", ({ e, request }) => {
  console.log("Error!", "\n", request.url, "\n", e);
});

use(async ({ url }, next) => {
  const st = Date.now();
  await next();
  const et = Date.now();
  console.log("Time Cost", url.pathname, et - st);
});

use(async ({ request, response, url }) => {
  const { method } = request;
  const { pathname, search } = url;

  const [err, data] = await jsonData<{ a: 1 }>(request);
  if (err) {
    return response(...ERR_RESPONSE_JSON_PARSE());
  }

  response(
    JSON.stringify(
      {
        method,
        pathname: pathname.split("/").slice(1),
        search,
        data,
      },
      null,
      4
    )
  );
});

const { server } = createServer(serverConfig);

server(callback);
