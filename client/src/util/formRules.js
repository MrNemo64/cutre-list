export function required(v) {
  return !!v || "This field is required";
}

export function geq(number) {
  return function (v) {
    const value = +v;
    if (!isFinite(value)) return "Invalid number";
    if (value < number) return `Must be ${number} or higher`;
    return true;
  };
}

export function isInteger(v) {
    const value = +v;
    if (!isFinite(value)) return "Invalid number";
    if (Math.floor(value) !== value) return "Must be an integer";
    return true;
}