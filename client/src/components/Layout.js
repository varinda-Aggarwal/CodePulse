import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-surface-bg transition-colors flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen">
                <TopBar />
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;