interface CmdConfig {
  "-p": string;
}

export const cmdConfig = (): CmdConfig => ({
  ...Object.fromEntries(Deno.args.map((val) => val.split("="))),
});
