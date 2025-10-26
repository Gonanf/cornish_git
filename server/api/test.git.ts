//Allow the person to submit onlye

export default defineEventHandler(async (event) => {
  return hubBlob().serve(event, "sqlite3_examples.git")
})
