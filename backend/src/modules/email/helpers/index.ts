export const handlebarHelpers = {
  times: function (n: number, block: any) {
    let accum = "";
    for (let i = 0; i < n; i++) accum += block.fn(i);
    return accum;
  },
  subtract: function (a: number, b: number) {
    return a - b;
  },
};
