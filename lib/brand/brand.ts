export const brand = {
  name: "Rodeo",
  shortName: "Rodeo",
  description:
    "Registro de ordeños y despachos de leche, en el campo y sin conexión.",
  colors: {
    primary: "#1F4D3A",
    primaryDeep: "#17392B",
    primaryLight: "#2C6B4E",
    primaryForeground: "#F7F3E9",
    clay: "#B5622F",
    background: "#FAF7F0",
    foreground: "#23211C",
    surface: "#FFFFFF",
  },
  assets: {
    mark: "/brand/logo-mark.svg",
    glyph: "/brand/logo-glyph.svg",
    lockup: "/brand/logo.svg",
  },
  icons: {
    public: [
      { file: "icon-192.png", size: 192, kind: "badge" },
      { file: "icon-512.png", size: 512, kind: "badge" },
      { file: "icon-maskable-512.png", size: 512, kind: "maskable" },
      { file: "apple-touch-icon.png", size: 180, kind: "maskable" },
    ],
    app: [
      { file: "icon.png", size: 512, kind: "badge" },
      { file: "apple-icon.png", size: 180, kind: "maskable" },
    ],
  },
} as const;

export type Brand = typeof brand;
