import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    heading: "'Outfit', sans-serif",
    body: "'Plus Jakarta Sans', sans-serif"
  },
  colors: {
    brand: {
      50: "#fff7ed",
      100: "#ffe6cc",
      200: "#ffc98f",
      300: "#ffac52",
      400: "#ff9131",
      500: "#f97316",
      600: "#d85f10",
      700: "#b44b0f",
      800: "#8c3a12",
      900: "#733114"
    },
    ink: {
      900: "#171717",
      800: "#262626",
      700: "#404040"
    },
    moss: {
      500: "#2f855a"
    },
    sand: {
      100: "#f8efe3",
      200: "#f4e4cf"
    }
  },
  styles: {
    global: {
      body: {
        bg: "#f8f3ea",
        color: "ink.900"
      }
    }
  }
});
