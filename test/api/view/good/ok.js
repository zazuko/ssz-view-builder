client.test("Resource exists", function() {
  client.assert(
    response.status === 200,
    "Status should be success"
  );
});
