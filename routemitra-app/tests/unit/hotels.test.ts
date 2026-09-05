import { describe, it, expect, afterEach } from "vitest";
import { hotelSearchLink } from "@/lib/hotels";

const KEY = "NEXT_PUBLIC_AFF_HOTELS";
const prev = process.env[KEY];

afterEach(() => {
  if (prev === undefined) delete process.env[KEY];
  else process.env[KEY] = prev;
});

describe("hotelSearchLink", () => {
  it("defaults to a Hotellook search for the city", () => {
    delete process.env[KEY];
    const l = hotelSearchLink("Goa");
    expect(l).toContain("search.hotellook.com");
    expect(l).toContain("destination=Goa");
  });

  it("uses NEXT_PUBLIC_AFF_HOTELS when set, substituting {city}", () => {
    process.env[KEY] = "https://www.booking.com/searchresults.html?ss={city}";
    const l = hotelSearchLink("New Delhi");
    expect(l).toBe("https://www.booking.com/searchresults.html?ss=New%20Delhi");
  });

  it("substitutes an already-encoded %7Bcity%7D (Cuelinks-wrapped links)", () => {
    process.env[KEY] =
      "https://linksredirect.com/?cid=316487&source=linkkit&url=https%3A%2F%2Fwww.booking.com%2Fsearchresults.html%3Fss%3D%7Bcity%7D";
    const l = hotelSearchLink("Jaipur");
    expect(l).toContain("ss%3DJaipur");
    expect(l).not.toContain("%7Bcity%7D");
  });

  it("threads check-in / check-out dates when the template asks for them", () => {
    process.env[KEY] =
      "https://x.test/?city={city}&in={checkIn}&out={checkOut}";
    const l = hotelSearchLink("Goa", { checkIn: "2026-12-25", checkOut: "2026-12-28" });
    expect(l).toBe("https://x.test/?city=Goa&in=2026-12-25&out=2026-12-28");
  });

  it("blanks a date placeholder when no valid date is given", () => {
    process.env[KEY] = "https://x.test/?city={city}&in={checkIn}";
    expect(hotelSearchLink("Goa")).toBe("https://x.test/?city=Goa&in=");
  });
});
