// No PostCSS plugins — globals.css is plain, framework-free CSS.
// (Tailwind was removed: it wrapped everything in @layer, which older iOS
//  Safari drops wholesale, leaving the app unstyled.)
const config = {
  plugins: {},
};

export default config;
