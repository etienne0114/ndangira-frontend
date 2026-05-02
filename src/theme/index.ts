import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    heading: "'Poppins', 'Inter', sans-serif",
    body: "'Inter', 'Poppins', sans-serif",
  },
  colors: {
    white: "#FFFFFF",
    black: "#1A1A2E",
    teal: "#0F7173",
    brand: {
      500: "#0F7173",
    },
  },
  styles: {
    global: {
      body: {
        bg: "#FFFFFF",
        color: "#1A1A2E",
        fontFamily: "'Inter', 'Poppins', sans-serif",
      },
      "*": {
        boxSizing: "border-box",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "8px",
        _focus: { boxShadow: "none" },
      },
    },
    Input: {
      defaultProps: { variant: "outline" },
      variants: {
        outline: {
          field: {
            borderRadius: "8px",
            border: "1px solid #1A1A2E",
            _focus: { borderWidth: "2px", boxShadow: "none", borderColor: "#1A1A2E" },
          },
        },
      },
    },
    Select: {
      defaultProps: { variant: "outline" },
    },
    Textarea: {
      defaultProps: { variant: "outline" },
      variants: {
        outline: {
          borderRadius: "8px",
          border: "1px solid #1A1A2E",
          _focus: { borderWidth: "2px", boxShadow: "none", borderColor: "#1A1A2E" },
        },
      },
    },
  },
});
