export const debug = (...param: any) => {
  if (process.env.DEBUG && Boolean(process.env.DEBUG) === true) console.log(param);
};
