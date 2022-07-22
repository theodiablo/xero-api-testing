export const randomString = (length = 8): string => {
  // Declare all characters
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Pick characers randomly
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
};

export const randomDate = (
  from: Date = new Date(2020, 0, 1),
  to: Date = new Date()
): Date => {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  return new Date(fromTime + Math.random() * (toTime - fromTime));
};

export const randomInt = (from: number, to: number): number => {
  return Math.floor(Math.random() * (to - from + 1)) + from;
};
