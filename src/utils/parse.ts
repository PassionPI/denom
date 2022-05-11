import { pipeline } from "../lib/fp_async.ts";

export const jsonData = <T>(request: Request) =>
  pipeline.resolve().pipe(() => request.json() as Promise<T>);

export const formDataEntries = (
  request: Request,
  deal: (value: FormData) => FormData = (v) => v
) =>
  pipeline
    .resolve(request)
    .pipe((req) => req.formData())
    .pipe(deal)
    .pipe((value) => value.entries());

export const formDataObject = <T extends Record<string, FormDataEntryValue>>(
  request: Request,
  deal: (value: FormData) => FormData = (v) => v
) =>
  pipeline
    .resolve(request)
    .pipe((req) => req.formData())
    .pipe(deal)
    .pipe((value) => value.entries())
    .pipe((entries) => Object.fromEntries(entries) as T);
