client.test("Request failed", function() {
  client.assert(response.status === 400, "Status should be Bad Request");
});
