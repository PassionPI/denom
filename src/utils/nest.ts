import type { BaseKey } from "../common/types.ts";
import { either } from "../lib/fp_async.ts";
import { emitter } from "./emitter.ts";

export interface Context<T extends Record<string, unknown>> {
  url: URL;
  ext: Partial<T>;
  request: Request;
  response: (body: BodyInit, init?: ResponseInit) => void;
}

export type ErrorAction = {
  error: { e: Error; url: URL; request: Request };
};

const resolve = () => Promise.resolve();

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

  const dispatch = (ctx: Ctx, i: number): Promise<void> => {
    let done = false;
    const fn = middlers[i] ?? resolve;
    return fn(ctx, () => {
      if (done) {
        throw new Error("Already called next()");
      }
      done = true;
      return dispatch(ctx, i + 1);
    });
  };

  const call = either(async (ctx: Ctx) => {
    await dispatch(ctx, 0);
  });

  const callback = async (request: Request): Promise<Response> => {
    let resp: Resp;
    const { url } = request;

    const ctx: Ctx = Object.freeze({
      request,
      url: new URL(url),
      response: (body, init) => {
        if (resp) {
          console.warn("Response reassigned!", body, init);
          return;
        }
        resp = new Response(body, init);
      },
      ext: {} as Ext,
    });

    const [e] = await call(ctx);

    if (e) {
      emit(
        "error",
        // deno-lint-ignore no-explicit-any
        { request, e } as ErrorAction["error"] as any
      );
      return new Response("Internal error", { status: 500 });
    }

    if (!resp) {
      return new Response("No Response", { status: 500 });
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
