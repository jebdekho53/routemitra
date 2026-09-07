import { describe, it, expect } from "vitest";
import {
  mapTripjackBusResults,
  tripjackBusEnabled,
} from "@/lib/adapters/tripjack-bus";

describe("tripjack-bus", () => {
  it("is disabled without TRIPJACK_API_KEY", () => {
    expect(tripjackBusEnabled()).toBe(false);
  });

  it("maps a search response into sorted RouteOptions", () => {
    // shape reflects the portal (operator, bus type, timings, min fare, seats)
    const resp = {
      searchResult: {
        buses: [
          {
            serviceName: "Shakti Travels",
            busType: "A/C Sleeper (2+1)",
            departureTime: "2026-09-08T23:00:00",
            arrivalTime: "2026-09-09T05:15:00",
            totalFare: 899,
          },
          {
            serviceName: "Mahalaxmi Travels",
            busType: "Mercedes Benz Multi-Axle Semi Sleeper (2+2)",
            departureTime: "2026-09-08T23:45:00",
            arrivalTime: "2026-09-09T06:00:00",
            fareDetails: { minFare: 2104 },
          },
          { serviceName: "", totalFare: 0 }, // dropped
        ],
      },
    };
    const opts = mapTripjackBusResults(resp);
    expect(opts).toHaveLength(2);
    expect(opts[0]).toMatchObject({
      mode: "bus",
      operator: "Shakti Travels (A/C Sleeper (2+1))",
      price: 899,
      departure: "23:00",
      arrival: "05:15",
      duration_min: 375,
      indicative: true,
      source: "tripjack",
    });
    expect(opts[1].price).toBe(2104); // sorted cheapest-first
  });

  it("returns [] for an empty / unexpected payload", () => {
    expect(mapTripjackBusResults({})).toEqual([]);
    expect(mapTripjackBusResults(null)).toEqual([]);
  });
});
