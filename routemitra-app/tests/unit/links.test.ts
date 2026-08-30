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
});
