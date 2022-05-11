export type OnRequest = (request: Request) => Promise<Response> | Response;

export const createServer = ({
  hostname,
  port,
}: {
  hostname: string;
  port: number;
}) => {
  const listener = Deno.listen({ hostname, port });

  const server = async (onRequest: OnRequest) => {
    const handle = async ({ http }: { http: Deno.HttpConn }) => {
      try {
        for await (const { request, respondWith } of http) {
          try {
            const resp = await onRequest(request);
            respondWith(resp);
          } catch (e) {
            respondWith(
              new Response(JSON.stringify({ message: e.message }), {
                status: 500,
              })
            );
          }
        }
      } catch (e) {
        console.error("Http Error:", e);
      }
    };

    try {
      for await (const conn of listener) {
        handle({ http: Deno.serveHttp(conn) });
      }
    } catch (e) {
      console.error("Conn Error:", e);
    }
  };

  return {
    server,
  };
};
