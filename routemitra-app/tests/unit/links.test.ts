import { describe, it, expect } from "vitest";
import { bookingLink } from "@/lib/links";

describe("bookingLink — route-aware deep links", () => {
  it("bus -> RedBus route page", () => {
    const l = bookingLink("bus", "Pune", "Bengaluru", "https://www.redbus.in/");
    expect(l).toContain("redbus.in/bus-tickets/pune-to-bengaluru");
    expect(l).toContain("utm_source=routemitra");
    expect(l).toContain("utm_campaign=bus_book");
  });

  it("train -> ConfirmTkt trains-between page", () => {
    const l = bookingLink("train", "Pune", "Bengaluru", "https://irctc.co.in/");
    expect(l).toContain(
      "confirmtkt.com/trains/pune-to-bengaluru-train-tickets",
    );
  });

  it("flight with known IATA -> Skyscanner", () => {
    const l = bookingLink("flight", "Mumbai", "Goa", "x");
    expect(l).toContain("skyscanner.co.in/transport/flights/bom/goi/");
  });

  it("flight with unknown city -> Google Flights query", () => {
    const l = bookingLink("flight", "Nowheresville", "Elsewhere", "x");
    expect(l).toContain("google.com/travel/flights");
    expect(l).toContain("q=flights+from+Nowheresville+to+Elsewhere");
  });

  it("applies city aliases", () => {
    const l = bookingLink("bus", "Bombay", "New Delhi", "https://redbus.in/");
    expect(l).toContain("mumbai-to-delhi");
  });

  it("slugs multi-word cities", () => {
    const l = bookingLink("train", "Vasco Da Gama", "Hubli", "x");
    expect(l).toContain("vasco-da-gama-to-hubli");
  });

  it("threads the date into each platform's format", () => {
    const d = "2026-09-05";
    expect(bookingLink("bus", "Pune", "Goa", "x", d)).toContain(
      "onward=05-Sep-2026",
    );
    expect(bookingLink("train", "Pune", "Goa", "x", d)).toContain(
      "date=05-09-2026",
    );
    expect(bookingLink("flight", "Mumbai", "Goa", "x", d)).toContain(
      "/bom/goi/260905/",
    );
    expect(bookingLink("flight", "Nowhere", "Elsewhere", "x", d)).toContain(
      "on+2026-09-05",
    );
  });

  it("omits date params when no date is given", () => {
    expect(bookingLink("bus", "Pune", "Goa", "x")).not.toContain("onward");
    expect(bookingLink("train", "Pune", "Goa", "x")).not.toContain("date=");
    expect(bookingLink("flight", "Mumbai", "Goa", "x")).toMatch(/\/bom\/goi\/\?/);
  });

  it("wraps bus/train (not flight) in Cuelinks when CUELINKS_CID is set", () => {
    const prev = process.env.CUELINKS_CID;
    process.env.CUELINKS_CID = "TESTCID";
    try {
      const bus = bookingLink("bus", "Pune", "Goa", "x");
      expect(bus).toMatch(/^https:\/\/linksredirect\.com\/\?cid=TESTCID&source=linkkit&url=/);
      expect(decodeURIComponent(bus)).toContain("redbus.in/bus-tickets/pune-to-goa");

      const train = bookingLink("train", "Pune", "Goa", "x");
      expect(train).toContain("linksredirect.com/?cid=TESTCID");

      // flights keep their own (Travelpayouts / Skyscanner) link
      expect(bookingLink("flight", "Mumbai", "Goa", "x")).not.toContain(
        "linksredirect.com",
      );
    } finally {
      if (prev === undefined) delete process.env.CUELINKS_CID;
      else process.env.CUELINKS_CID = prev;
    }
  });
});
