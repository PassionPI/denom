interface Mid<T> {
  (ctx: T, next: () => Promise<void>): Promise<void>;
}

const resolve = () => Promise.resolve();

export const shuttle =
  <Ctx>(fns: Array<Mid<Ctx>>, end: () => Promise<void> = resolve) =>
  (ctx: Ctx) => {
    const dispatch = async (i: number): Promise<void> => {
      let done = false;
      const fn = fns[i] ?? end;
      const pm = await fn(ctx, () => {
        if (done) return resolve();
        done = true;
        return dispatch(i + 1);
      });
      return pm;
    };
    return dispatch(0);
  };
