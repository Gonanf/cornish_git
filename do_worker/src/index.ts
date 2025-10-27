export class MyDurableObject extends DurableObject {
  // Your DO code goes here
}

export default {
  fetch() {
      // Doesn't have to do anything, but a DO cannot be the default export
      return new Response("Hello, world!");
  },
};