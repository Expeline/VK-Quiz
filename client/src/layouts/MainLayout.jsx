import EmojiBackdrop from "../components/EmojiBackdrop/EmojiBackdrop";
import Navbar from "../components/NavBar/NavBar";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";

const titleByPath = [
    { test: (pathname) => pathname === "/", key: "meta.home" },
    { test: (pathname) => pathname === "/login", key: "meta.login" },
    { test: (pathname) => pathname === "/register", key: "meta.register" },
    { test: (pathname) => pathname === "/profile", key: "meta.profile" },
    { test: (pathname) => pathname.includes("/organizer/create"), key: "meta.createQuiz" },
    { test: (pathname) => pathname.includes("/edit"), key: "meta.editQuiz" },
    { test: (pathname) => pathname.includes("/rooms/"), key: "meta.liveRoom" },
    { test: (pathname) => pathname.includes("/history"), key: "meta.history" },
    { test: (pathname) => pathname.includes("/participant/join"), key: "meta.join" },
    { test: (pathname) => pathname.startsWith("/dashboard"), key: "meta.dashboard" },
];

function MainLayout({ children }) {
    const { pathname } = useLocation();
    const { t } = useLanguage();
    const isHome = pathname === "/";

    useEffect(() => {
        const match = titleByPath.find((entry) => entry.test(pathname));
        document.title = `${match ? t(match.key) : "Green Quiz"} | Green Quiz`;

        let icon = document.querySelector("link[rel='icon']");
        if (!icon) {
            icon = document.createElement("link");
            icon.rel = "icon";
            document.head.appendChild(icon);
        }
        icon.href = "/site-avatar.svg";
        icon.type = "image/svg+xml";
    }, [pathname, t]);

    return (
        <div className="min-h-screen transition-colors duration-300">
            <EmojiBackdrop />
            <Navbar />

            <main
                className={[
                    "app-shell relative box-border max-w-7xl px-0 sm:px-6 lg:px-8",
                    isHome ? "pb-28 pt-5 sm:pt-6 lg:pb-5" : "pb-28 pt-5 sm:pt-8 lg:pb-16",
                ].join(" ")}
            >
                {children}
            </main>
        </div>
    );
}

export default MainLayout;
