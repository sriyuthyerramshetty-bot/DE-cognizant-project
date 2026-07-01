import { Outlet } from 'react-router-dom';
import Sidebar, { SidebarItem } from '../components/Sidebar.jsx';
import { Home, Calendar, Settings, GlobeCheck, ShoppingCart } from 'lucide-react';

// Layout for the authenticated part of the app: the sidebar plus a content
// area. <Outlet /> renders whichever page route is currently active.
function MainLayout() {
    return (
        <main className="App flex min-h-screen">
            <Sidebar>
                <SidebarItem icon={<Home />} text="Home" to="/" end />
                <SidebarItem icon={<Calendar />} text="Calendar" to="/calendar" />
                <SidebarItem icon={<Settings />} text="Settings" to="/settings" />
                <SidebarItem icon={<GlobeCheck />} text="Plans" to="/plan" />
                <SidebarItem icon={<ShoppingCart />} text="Cart" to="/cart" />
            </Sidebar>

            {/* Dynamically render the active page */}
            <section className="flex-1">
                <Outlet />
            </section>
        </main>
    );
}

export default MainLayout;