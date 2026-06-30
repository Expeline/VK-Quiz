import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext/ThemeContext.jsx";
import { LanguageProvider } from "./context/LanguageContext/LanguageContext.jsx";
import { ConfirmProvider } from "./context/ConfirmContext/ConfirmContext.jsx";
import { Analytics } from "@vercel/analytics/react";

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <ConfirmProvider>
                    <AuthProvider>
                        <AppRouter />
                        <Analytics />
                    </AuthProvider>
                </ConfirmProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
