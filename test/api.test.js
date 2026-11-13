const assert = require("node:assert/strict");
const http = require("node:http");
const { after, before, describe, it } = require("node:test");
const { createApp } = require("../src/index");

function request(server, method, path, body) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: payload
          ? {
              "content-type": "application/json",
              "content-length": Buffer.byteLength(payload),
            }
          : {},
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: res.statusCode,
            json: raw ? JSON.parse(raw) : null,
          });
        });
      },
    );
    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

describe("tasks-api", () => {
  let server;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
  });

  after(() => {
    server.close();
  });

  it("reports health", async () => {
    const response = await request(server, "GET", "/health");
    assert.equal(response.status, 200);
    assert.equal(response.json.status, "ok");
    assert.equal(response.json.service, "tasks-api");
  });

  it("starts with no tasks", async () => {
    const response = await request(server, "GET", "/api/tasks");
    assert.equal(response.status, 200);
    assert.deepEqual(response.json, []);
  });

  it("creates a task", async () => {
    const created = await request(server, "POST", "/api/tasks", {
      title: "  practice helm  ",
    });
    assert.equal(created.status, 201);
    assert.equal(created.json.title, "practice helm");
    assert.equal(created.json.done, false);

    const listed = await request(server, "GET", "/api/tasks");
    assert.equal(listed.json.length, 1);
    assert.equal(listed.json[0].id, created.json.id);
  });

  it("rejects a missing title", async () => {
    const response = await request(server, "POST", "/api/tasks", {});
    assert.equal(response.status, 400);
    assert.equal(response.json.error, "title is required");
  });
});
