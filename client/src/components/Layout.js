import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;