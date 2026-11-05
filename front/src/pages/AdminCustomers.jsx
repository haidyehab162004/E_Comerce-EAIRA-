import { useState, useEffect } from 'react';
import {
  Search, Bell, Trash2, X, Menu
} from 'lucide-react';
import { adminApi, getImageUrl } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

// ====== Modal لعرض طلبات عميل محدد ======
const UserOrdersModal = ({ user, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Since getOrders takes query params but our api.js doesn't pass params for getOrders
        const filterRes = await adminApi.getOrders({ userId: user._id || user.id });
        setOrders(filterRes.orders || filterRes || []);
      } catch (err) {
        console.error('Error fetching user orders:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const statusColor = {
    delivered:  'bg-green-100 text-green-700',
    processing: 'bg-yellow-100 text-yellow-700',
    shipped:    'bg-blue-100 text-blue-700',
    pending:    'bg-gray-100 text-gray-600',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface w-full max-w-3xl shadow-2xl rounded-sm relative max-h-[90dvh] flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-line">
          <div>
            <h2 className="text-xl font-serif text-gray-900">{user.name}'s Orders</h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No orders found for this customer.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id || order.id} className="border border-line rounded-sm p-4 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-50">
                    <div>
                      <p className="font-bold text-gray-900">Order #{String(order._id || order.id).slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{order.items?.length || 0} items</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">${(order.totalAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Items List */}
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Items</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-surface-muted p-2 rounded-sm">
                            <div className="w-10 h-10 bg-gray-200 overflow-hidden flex-shrink-0">
                              {item.product?.image || item.productImage ? (
                                <img src={getImageUrl(item.product?.image || item.productImage)} alt={item.product?.name || item.productName || 'Product'} className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-grow">
                              <p className="text-xs font-bold text-gray-900 break-words">{item.product?.name || item.productName || 'Unknown Product'}</p>
                              <p className="text-[10px] text-gray-500">
                                {item.quantity}x • {item.size && `${item.size} `}{item.color && `(${item.color})`}
                              </p>
                            </div>
                            <p className="text-xs font-bold text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ====== الصفحة الرئيسية لإدارة العملاء ======
const AdminCustomers = () => {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // لعرض المودال
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data.users || data || []);
    } catch (err) {
      console.error('خطأ في جلب المستخدمين:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUsers(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await adminApi.deleteUser(id);
      loadUsers();
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  // فلترة العملاء بالبحث
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen min-w-0 bg-bg flex relative">
      <AdminSidebar active="Customers" isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {selectedUser && (
        <UserOrdersModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <main className="min-h-screen min-w-0 flex-grow">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b border-line-strong bg-surface px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4 flex-grow">
            <button 
              className="lg:hidden text-gray-900 hover:text-gray-600 transition-colors shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2 w-full max-w-md">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs outline-none w-full placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Customer Management</p>
            <h1 className="text-2xl sm:text-3xl font-serif text-gray-900">Customers</h1>
            <p className="text-sm text-gray-400 mt-1 max-w-md">
              View your customer base, review their order history, and manage accounts.
            </p>
          </div>

          {/* Customers Table */}
          <div className="bg-surface border border-line shadow-sm rounded-sm overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="border-b border-line">
                <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-surface-muted">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-gray-400 text-sm">Loading customers...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-gray-400 text-sm">No customers found.</td>
                  </tr>
                ) : filtered.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-surface-muted transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      {user.isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded">Admin</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {/* زر الإشعارات / عرض الطلبات */}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors group"
                          title="View Orders"
                        >
                          <Bell size={18} />
                          {/* Badge لعدد الطلبات */}
                          {user.ordersCount > 0 && (
                            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-sm">
                              {user.ordersCount}
                            </span>
                          )}
                        </button>
                        
                        {/* زر حذف المستخدم */}
                        <button
                          onClick={() => handleDelete(user._id || user.id, user.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            {!loading && filtered.length > 0 && (
              <div className="px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-2 bg-surface-muted border-t border-line rounded-b-sm">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Showing {filtered.length} customers
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCustomers;
