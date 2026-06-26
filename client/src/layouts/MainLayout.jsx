import Navbar from "../components/NavBar/NavBar";

function MainLayout({ children }) {
    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}

export default MainLayout;
