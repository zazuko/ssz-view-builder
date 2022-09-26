client.test("Request failed", function() {
  client.assert(response.status === 409, "Status should be Conflict");
});
