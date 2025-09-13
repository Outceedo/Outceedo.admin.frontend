import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import AdminLayout from "./components/admin/layout";
import Dashboardadmin from "./components/admin/dashboard";
import AdminLayoutdefault from "./components/admin/defaultlayout";

import Player from "./Adminpages/Player/Player";
import Booking from "./Adminpages/Player/Booking";
import SponsorShipApplication from "./Adminpages/Player/SponsorShipApplication";
import ServiceTransaction from "./Adminpages/Player/ServiceTransaction";
import Media from "./Adminpages/Player/Media";

import Expert from "./Adminpages/Expert/Expert";
import ExpertBooking from "./Adminpages/Expert/ExpertBooking";
import ExpertMedia from "./Adminpages/Expert/ExpertMedia";
import ExpertServices from "./Adminpages/Expert/ExpertServices";
import PaymentClaims from "./Adminpages/Expert/PaymentClaims";

import Sponsor from "./Adminpages/Sponsor/Sponsor";
import Playersrequest from "./Adminpages/Sponsor/Playersrequest";
import SponsorMedia from "./Adminpages/Sponsor/SponsorMedia";
import SponsorshipOfferedTable from "./Adminpages/Sponsor/Sponsorshipoffered";
import SponsorshipTransactions from "./Adminpages/Sponsor/Sponsorshiptransactions";

import RegisteredTeams from "./Adminpages/Teams/RegisteredTeams";
import RegisteredClubs from "./Adminpages/Teams/RegisteredClubs";
import PlayersAssociations from "./Adminpages/Teams/PlayersAssociations";
import ReviewsComments from "./Adminpages/Teams/Reviews&Comments";
import Activities from "./Adminpages/Teams/Activities";

import Fans from "./Adminpages/Fans/Fans";
import Reviews from "./Adminpages/Fans/FansReviews";
import Interests from "./Adminpages/Fans/Interest";
import Comments from "./Adminpages/Fans/comments";
import ScrollToTop from "./common/ScrollToTop";
import AdminLogin from "./components/auth/login";

// ---------------------- Auth Context ----------------------
interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  login: (token: string, role?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------- Auth Provider ----------------------
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    // ✅ Look for both normal token and adminToken
    const token =
      localStorage.getItem("token") || localStorage.getItem("adminToken");
    const userRole =
      localStorage.getItem("role") ||
      (localStorage.getItem("isAdmin") ? "admin" : null);

    const hasAuth = Boolean(token);
    setIsAuthenticated(hasAuth);
    setRole(userRole);
    return hasAuth;
  };

  useEffect(() => {
    checkAuth();
    setLoading(false);
  }, []);

  const login = (token: string, role: string = "user") => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (role === "admin") {
      localStorage.setItem("adminToken", token);
      localStorage.setItem("isAdmin", "true");
    }
    setIsAuthenticated(true);
    setRole(role);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("username");
    localStorage.removeItem("userid");
    localStorage.removeItem("viewplayerusername");
    localStorage.removeItem("planId");
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------- Hook ----------------------
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// ---------------------- Loading Screen ----------------------
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// ---------------------- Protected Route ----------------------
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// ---------------------- App Routes ----------------------
const AppRoutes = () => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Redirect login routes to dashboard if authenticated */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/login"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      {/* Dashboard with default layout */}
      <Route path="/admin" element={<AdminLayoutdefault />}>
        <Route path="dashboard" element={<Dashboardadmin />} />
      </Route>

      {/* Admin routes with sidebar layout */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Player Routes */}
        <Route path="player" element={<Player />} />
        <Route path="player/booking" element={<Booking />} />
        <Route
          path="player/sponsorshipapplication"
          element={<SponsorShipApplication />}
        />
        <Route path="player/media" element={<Media />} />
        <Route
          path="player/ServiceTransaction"
          element={<ServiceTransaction />}
        />

        {/* Expert Routes */}
        <Route path="expert" element={<Expert />} />
        <Route path="expert/booking" element={<ExpertBooking />} />
        <Route path="expert/paymentclaims" element={<PaymentClaims />} />
        <Route path="expert/media" element={<ExpertMedia />} />
        <Route path="expert/services" element={<ExpertServices />} />

        {/* Sponsor Routes */}
        <Route path="sponsor" element={<Sponsor />} />
        <Route path="sponsor/sponsormedia" element={<SponsorMedia />} />
        <Route path="sponsor/playersrequest" element={<Playersrequest />} />
        <Route
          path="sponsor/sponsorshipoffered"
          element={<SponsorshipOfferedTable />}
        />
        <Route
          path="sponsor/SponsorshipTransactions"
          element={<SponsorshipTransactions />}
        />

        {/* Team Routes */}
        <Route path="team" element={<RegisteredTeams />} />
        <Route path="team/registeredclubs" element={<RegisteredClubs />} />
        <Route
          path="team/playersassociations"
          element={<PlayersAssociations />}
        />
        <Route path="team/reviews&comments" element={<ReviewsComments />} />
        <Route path="team/activities" element={<Activities />} />

        {/* Fans Routes */}
        <Route path="fan" element={<Fans />} />
        <Route path="fan/reviews" element={<Reviews />} />
        <Route path="fan/interests" element={<Interests />} />
        <Route path="fan/comments" element={<Comments />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

// ---------------------- Main App ----------------------
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export { useAuth };
export default App;
