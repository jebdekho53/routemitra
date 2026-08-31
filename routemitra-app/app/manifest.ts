import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RouteMitra — Bus, Train & Flight compare",
    short_name: "RouteMitra",
    description:
      "Ek city se dusri city — bus, train aur flight ek jagah compare karo. Sabse sasta ya sabse tez chuno.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f4f7",
    theme_color: "#0a6ed1",
    lang: "hi",
    dir: "ltr",
    categories: ["travel", "navigation", "utilities"],
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
    shortcuts: [
      {
        name: "Popular routes",
        url: "/#main",
        description: "Jump to popular route cards",
      },
      {
        name: "My dashboard",
        url: "/dashboard",
        description: "Saved searches & price alerts",
      },
    ],
  };
}
