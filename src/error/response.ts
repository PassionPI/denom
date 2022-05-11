const MESSAGE_JSON_ERROR = JSON.stringify({ message: "JSON parse error!" });

export const ERR_RESPONSE_JSON_PARSE = () =>
  [
    MESSAGE_JSON_ERROR,
    {
      status: 400,
    },
  ] as const;
