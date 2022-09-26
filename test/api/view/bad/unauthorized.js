client.test("Request failed", function() {
  client.assert(response.status === 401, "Status should be Unauthorized");
});
