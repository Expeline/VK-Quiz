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
                    "relative mx-auto box-border w-screen max-w-screen px-3 sm:px-6 lg:px-8 xl:max-w-7xl",
                    isHome ? "pb-5 pt-4 sm:pt-5" : "pb-10 pt-5 sm:pb-16 sm:pt-8",
                ].join(" ")}
            >
                {children}
            </main>
        </div>
    );
}

export default MainLayout;
