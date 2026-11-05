const Icon = ({ size = 24, className, children }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const ArrowRight = (props) => <Icon {...props}><path d="M5 12h14M12 5l7 7-7 7" /></Icon>;
export const ShoppingBag = (props) => <Icon {...props}><path d="M6 7h12l1 14H5L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></Icon>;
export const Menu = (props) => <Icon {...props}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>;
export const X = (props) => <Icon {...props}><path d="m18 6-12 12M6 6l12 12" /></Icon>;
export const LogOut = (props) => <Icon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></Icon>;
export const Heart = (props) => <Icon {...props}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></Icon>;
export const User = (props) => <Icon {...props}><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></Icon>;
export const ChevronDown = (props) => <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon>;
export const LayoutDashboard = (props) => <Icon {...props}><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="5" rx="1" /><rect x="13" y="10" width="8" height="11" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /></Icon>;
export const CheckCircle = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></Icon>;
export const XCircle = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6m0-6 6 6" /></Icon>;
export const Info = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></Icon>;
export const Home = (props) => <Icon {...props}><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z" /></Icon>;
export const Store = (props) => <Icon {...props}><path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" /><path d="M3 10 4.5 4h15L21 10Z" /><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M9.5 20v-6h5v6" /></Icon>;
export const Sun = (props) => <Icon {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>;
export const Moon = (props) => <Icon {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Icon>;
export const Globe = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20Z" /></Icon>;
