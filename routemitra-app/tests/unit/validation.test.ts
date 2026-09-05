import { describe, it, expect } from "vitest";
import { parse, searchQuerySchema } from "@/lib/validation";

describe("searchQuerySchema", () => {
  it("accepts a normal from/to pair", () => {
    const { data, errors } = parse(searchQuerySchema, {
      from: "Pune",
      to: "Bengaluru",
    });
    expect(errors).toBeNull();
    expect(data?.from).toBe("Pune");
  });

  it("rejects from and to being the same place", () => {
    const { data, errors } = parse(searchQuerySchema, {
      from: "Mumbai",
      to: "Mumbai",
    });
    expect(data).toBeNull();
    expect(errors?.to).toMatch(/can't be the same/i);
  });

  it("is case/whitespace insensitive for the same-place check", () => {
    const { errors } = parse(searchQuerySchema, {
      from: "  mumbai",
      to: "MUMBAI ",
    });
    expect(errors?.to).toBeTruthy();
  });
});
