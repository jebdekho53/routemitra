// IATA carrier code -> display name, plus a free logo CDN (Aviasales/pics.avs.io).

const AIRLINES: Record<string, string> = {
  "6E": "IndiGo",
  AI: "Air India",
  UK: "Vistara",
  SG: "SpiceJet",
  QP: "Akasa Air",
  IX: "Air India Express",
  G8: "Go First",
  I5: "AIX Connect",
  "9I": "Alliance Air",
  BA: "British Airways",
  EK: "Emirates",
  EY: "Etihad",
  QR: "Qatar Airways",
  SQ: "Singapore Airlines",
  LH: "Lufthansa",
  TG: "Thai Airways",
  MH: "Malaysia Airlines",
  ZZ: "Duffel Airways", // sandbox test carrier
};

export function airlineName(code: string): string {
  return AIRLINES[code?.toUpperCase()] ?? code ?? "Airline";
}

export function airlineLogo(code: string): string | undefined {
  if (!code) return undefined;
  return `https://pics.avs.io/60/60/${code.toUpperCase()}.png`;
}
