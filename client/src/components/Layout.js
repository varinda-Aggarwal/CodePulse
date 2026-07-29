import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-surface-bg transition-colors flex">
            <Sidebar />
            <main className="flex-1 p-8">
                <TopBar />
                {children}
            </main>
        </div>
    );
};

export default Layout;