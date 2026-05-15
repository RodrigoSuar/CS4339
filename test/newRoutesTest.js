/* global describe, it, before */
/**
 * Tests for the two new endpoints added in this project:
 *   POST /photos              -- save a Cloudinary URL as a Photo
 *   POST /photos/:photoId/like -- toggle a like on a photo
 *
 * Run with the rest of the suite via `npm test` in this directory.
 */

import assert from "assert";
import http from "http";

const HOST = "localhost";
const PORT = 3001;
const SEEDED_PASSWORD = "password";

function request({ method, path, headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        path,
        method,
        headers: {
          ...headers,
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          let parsed = raw;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch {
            // non-JSON body (e.g. plain text error); leave as string
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe("New routes", function () {
  let authCookie;
  let tookId;
  let createdPhotoId;

  before(async function () {
    const login = await request({
      method: "POST",
      path: "/admin/login",
      body: { login_name: "took", password: SEEDED_PASSWORD },
    });
    assert.strictEqual(login.statusCode, 200, "Login should succeed");
    tookId = login.body._id;

    const setCookie = login.headers["set-cookie"];
    assert(setCookie && setCookie.length, "Login should set a session cookie");
    authCookie = setCookie[0].split(";")[0];
  });

  describe("POST /photos", function () {
    it("saves a photo when given a url", async function () {
      const res = await request({
        method: "POST",
        path: "/photos",
        headers: { Cookie: authCookie },
        body: { url: "https://example.com/test.jpg" },
      });
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.file_name, "https://example.com/test.jpg");
      assert.strictEqual(String(res.body.user_id), String(tookId));
      assert(res.body._id, "Response should include the new photo's _id");
      createdPhotoId = res.body._id;
    });

    it("returns 400 when url is missing", async function () {
      const res = await request({
        method: "POST",
        path: "/photos",
        headers: { Cookie: authCookie },
        body: {},
      });
      assert.strictEqual(res.statusCode, 400);
    });

    it("returns 401 when unauthenticated", async function () {
      const res = await request({
        method: "POST",
        path: "/photos",
        body: { url: "https://example.com/anon.jpg" },
      });
      assert.strictEqual(res.statusCode, 401);
    });
  });

  describe("POST /photos/:photoId/like", function () {
    it("adds a like on the first request", async function () {
      assert(createdPhotoId, "Need a photo id from the POST /photos test");
      const res = await request({
        method: "POST",
        path: `/photos/${createdPhotoId}/like`,
        headers: { Cookie: authCookie },
      });
      assert.strictEqual(res.statusCode, 200);
      const likes = (res.body.likes || []).map((id) => String(id));
      assert(
        likes.includes(String(tookId)),
        "User id should be in the likes array after first request"
      );
    });

    it("removes the like on the second request (toggle)", async function () {
      const res = await request({
        method: "POST",
        path: `/photos/${createdPhotoId}/like`,
        headers: { Cookie: authCookie },
      });
      assert.strictEqual(res.statusCode, 200);
      const likes = (res.body.likes || []).map((id) => String(id));
      assert(
        !likes.includes(String(tookId)),
        "User id should be removed from the likes array on second request"
      );
    });

    it("returns 401 when unauthenticated", async function () {
      const res = await request({
        method: "POST",
        path: `/photos/${createdPhotoId}/like`,
      });
      assert.strictEqual(res.statusCode, 401);
    });
  });
});
