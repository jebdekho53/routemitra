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

  it("rejects a nickname/canonical pair for the same city (Bombay vs Mumbai)", () => {
    const { data, errors } = parse(searchQuerySchema, {
      from: "Bombay",
      to: "Mumbai",
    });
    expect(data).toBeNull();
    expect(errors?.to).toMatch(/can't be the same/i);
  });

  it("rejects an IATA code paired with its own city (BOM vs Mumbai)", () => {
    const { errors } = parse(searchQuerySchema, {
      from: "BOM",
      to: "Mumbai",
    });
    expect(errors?.to).toBeTruthy();
  });
});
