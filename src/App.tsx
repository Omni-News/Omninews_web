import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import News from "./pages/News";
import RssFeed from "./pages/RssFeed";
import Search from "./pages/Search";
import Folders from "./pages/Folders";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ff8c00",
      light: "#ffa500",
      dark: "#d97700",
    },
    secondary: {
      main: "#ff6b35",
      light: "#ff8554",
      dark: "#e55a2b",
    },
    background: {
      default: "#0a0a0a",
      paper: "#1a1a1a",
    },
    text: {
      primary: "#ff8c00",
      secondary: "#808080",
    },
    divider: "#333333",
  },
  typography: {
    fontFamily: '"Courier New", Courier, monospace',
    h1: {
      fontWeight: 700,
      textTransform: "uppercase",
    },
    h2: {
      fontWeight: 700,
      textTransform: "uppercase",
    },
    h3: {
      fontWeight: 700,
      textTransform: "uppercase",
    },
    h4: {
      fontWeight: 700,
      textTransform: "uppercase",
    },
    h5: {
      fontWeight: 700,
      textTransform: "uppercase",
    },
    h6: {
      fontWeight: 700,
      textTransform: "uppercase",
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          fontWeight: 700,
          borderRadius: 0,
          boxShadow: "none",
          border: "2px solid #ff8c00",
          "&:hover": {
            boxShadow: "4px 4px 0px #ff8c00",
            transform: "translate(-2px, -2px)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: "none",
          border: "2px solid #333",
          backgroundImage: "radial-gradient(circle, #222 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundColor: "#1a1a1a",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: "2px solid #333",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: "1px solid #ff8c00",
          backgroundColor: "#0a0a0a",
          color: "#ff8c00",
          fontFamily: '"Courier New", Courier, monospace',
          fontWeight: 700,
        },
      },
    },
  },
});

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter basename="/omninews">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/news" replace />} />
                <Route path="news" element={<News />} />
                <Route path="rss" element={<RssFeed />} />
                <Route path="search" element={<Search />} />
                <Route path="folders" element={<Folders />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
