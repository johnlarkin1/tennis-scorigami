/**
 * @jest-environment node
 */
import { bad } from "@/lib/errors";

describe("bad", () => {
  it("returns 400 status by default", async () => {
    const res = bad("Something went wrong");
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body).toEqual({ error: "Something went wrong" });
  });

  it("accepts custom status code", async () => {
    const res = bad("Not found", 404);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body).toEqual({ error: "Not found" });
  });

  it("returns JSON content type", () => {
    const res = bad("err");
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});
