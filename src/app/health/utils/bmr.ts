export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female"
): number => {
  const genderFactor = gender === "male" ? 5 : -161;
  const bmr = (10 * weight) + (6.25 * height) - (5 * age) + genderFactor;
  return Math.round(bmr);
};
