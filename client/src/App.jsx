import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext/ThemeContext.jsx";
import { Analytics } from "@vercel/analytics/react";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppRouter />
                <Analytics />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
