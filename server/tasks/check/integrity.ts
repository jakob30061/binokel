export default defineTask({
  meta: {
    name: "check:integrity",
    description: "",
  },
  run({ payload, context }) {
    return { result: "Success" };
  },
});