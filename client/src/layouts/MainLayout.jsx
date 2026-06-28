import Navbar from "../components/NavBar/NavBar";
import EmojiBackdrop from "../components/EmojiBackdrop/EmojiBackdrop";
import { useLocation } from "react-router-dom";

function MainLayout({ children }) {
    const { pathname } = useLocation();
    const isHome = pathname === "/";

    return (
        <div className="min-h-screen transition-colors duration-300">
            <EmojiBackdrop />
            <Navbar />

            <main
                className={[
                    "relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
                    isHome ? "pb-5 pt-5" : "pb-16 pt-8",
                ].join(" ")}
            >
                {children}
            </main>
        </div>
    );
}

export default MainLayout;
