import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RouteMitra — Bus, Train & Flight compare",
    short_name: "RouteMitra",
    description:
      "Ek city se dusri city — bus, train aur flight ek jagah compare karo.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef1ef",
    theme_color: "#c1502e",
    lang: "hi",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
