import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext/AuthContext.jsx";

function App() {
    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
}

export default App;
