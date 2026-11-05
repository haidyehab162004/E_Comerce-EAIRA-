import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Store, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const AdminSidebar = ({ active, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const { userName: adminName, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard'  },
    { to: '/admin/products',  icon: Package,         label: 'Products'   },
    { to: '/admin/orders',    icon: ShoppingCart,    label: 'Orders'     },
    { to: '/admin/customers', icon: Users,           label: 'Customers'  },
    { to: '/',                icon: Store,           label: 'Storefront' },
  ];

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary text-white shadow-xl shadow-primary/10 transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full hidden lg:flex'}`}>
        <div className="flex items-center justify-between border-b border-white/10 p-7 lg:border-none lg:pb-5">
          <div>
            <Link to="/" className="text-2xl font-serif font-bold tracking-[0.2em]">AEIRA</Link>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/55">Studio administration</p>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-grow space-y-1 px-3 py-7">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to} to={to}
              className={`flex items-center space-x-3 rounded-sm px-3 py-3 text-sm font-medium transition-colors ${
                active === label
                  ? 'bg-surface/12 text-white shadow-inner'
                  : 'text-white/65 hover:bg-surface/8 hover:text-white'
              }`}
            >
              <Icon size={16} /><span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-4 px-1">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold uppercase">
              {adminName?.[0] || 'A'}
            </div>
            <span className="text-xs text-gray-300 truncate">{adminName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 w-full text-xs font-medium text-gray-400 hover:text-white hover:bg-surface/10 rounded-lg transition-colors"
          >
            <LogOut size={14} /><span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
