import Navbar from "../components/Navbar/Navbar";

function MainLayout({ children }) {
    return (
        <>
            <Navbar />
            <main>
                {children}
            </main>
        </>
    );
}

export default MainLayout;