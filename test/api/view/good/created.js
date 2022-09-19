client.test("View created", function() {
  client.assert(
    response.status === 201,
    "Status should be success"
  );
});
