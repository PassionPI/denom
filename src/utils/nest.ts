import type { BaseKey } from "../common/types.ts";
import { ERR_RESPONSE_NO_RESPONSE } from "../error/response.ts";
import { either } from "../lib/fp_async.ts";
import { emitter } from "./emitter.ts";
import { shuttle } from "./shuttle.ts";

export interface Context<T extends Record<string, unknown>> {
  url: URL;
  ext: Partial<T>;
  request: Request;
  response: (resp: Response) => void;
}

export type ErrorAction = {
  error: { err: Error; request: Request };
};

export const nest = <
  Ext extends Record<string, unknown> = Record<string, unknown>,
  Action extends Record<BaseKey, unknown> = Record<BaseKey, unknown>
>() => {
  type Ctx = Context<Ext>;
  type Resp = Response | undefined;
  type Middleware = (ctx: Ctx, next: () => Promise<void>) => Promise<void>;

  const { on, off, emit } = emitter<Action & ErrorAction>();

  const middlers: Middleware[] = [];

  const use = (middleware: Middleware) => {
    middlers.push(middleware);
  };

  const go = shuttle(middlers);

  const call = either(async (ctx: Ctx) => {
    await go(ctx);
  });

  const callback = async (request: Request): Promise<Response> => {
    let resp: Resp;
    const { url } = request;

    const ctx: Ctx = Object.freeze({
      request,
      url: new URL(url),
      response: (res) => {
        if (resp) {
          console.warn("Response reassigned!", resp);
          return;
        }
        resp = res;
      },
      ext: {} as Ext,
    });

    const [err] = await call(ctx);

    if (err) {
      emit(
        "error",
        // deno-lint-ignore no-explicit-any
        { request, err } as ErrorAction["error"] as any
      );
      return new Response(
        JSON.stringify({
          message: `Internal error: ${err.message}`,
        }),
        { status: 500 }
      );
    }

    if (!resp) {
      return ERR_RESPONSE_NO_RESPONSE();
    }

    return resp;
  };

  return {
    on,
    off,
    emit,
    use,
    callback,
  };
};
