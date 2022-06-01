const MESSAGE_JSON_ERROR = JSON.stringify({ message: "JSON parse error!" });
const MESSAGE_NO_RESPONSE = JSON.stringify({ message: "No Response" });

export const ERR_RESPONSE_JSON_PARSE = () =>
  new Response(MESSAGE_JSON_ERROR, {
    status: 400,
  });

export const ERR_RESPONSE_NO_RESPONSE = () =>
  new Response(MESSAGE_NO_RESPONSE, {
    status: 500,
  });
