/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}", "./!(build|dist|.*)/**/*.{html,js}"],
  theme: {
    extend: {
      spacing: {
        "padding-vertical-large": "144px",
        "space-medium": "48px",
        "space-extra-small": "12px",
        "size-075": "12px",
        "size-15": "24px",
        "padding-vertical-none": "0px",
        "padding-horizontal-main": "56px",
        "grid-gap-main": "20px",
        "size-2": "32px",
        "size-05": "8px",
        "padding-vertical-main": "96px",
        "space-small": "24px",
        "space-large": "64px",
      },
      borderRadius: {
        "radius-main": "8px",
        "radius-round": "99999px",
      },
      borderWidth: {
        "border-width-main": "1.5px",
      },
    },
    screens: {},
  },
  corePlugins: {
    preflight: false,
  },
};
