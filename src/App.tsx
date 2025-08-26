import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        {/* Default admin layout */}
        <Route path="/admin" element={<AdminLayoutdefault />}>
          <Route path="dashboard" element={<Dashboardadmin />} />
        </Route>

        {/* Authenticated admin layout */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Player */}
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

          {/* Expert */}
          <Route path="expert" element={<Expert />} />
          <Route path="expert/booking" element={<ExpertBooking />} />
          <Route path="expert/paymentclaims" element={<PaymentClaims />} />
          <Route path="expert/media" element={<ExpertMedia />} />
          <Route path="expert/services" element={<ExpertServices />} />

          {/* Sponsor */}
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

          {/* Team */}
          <Route path="team" element={<RegisteredTeams />} />
          <Route path="team/registeredclubs" element={<RegisteredClubs />} />
          <Route
            path="team/playersassociations"
            element={<PlayersAssociations />}
          />
          <Route path="team/reviews&comments" element={<ReviewsComments />} />
          <Route path="team/activities" element={<Activities />} />

          {/* Fans */}
          <Route path="fan" element={<Fans />} />
          <Route path="fan/reviews" element={<Reviews />} />
          <Route path="fan/interests" element={<Interests />} />
          <Route path="fan/comments" element={<Comments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
