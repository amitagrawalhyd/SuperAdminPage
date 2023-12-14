import React, { createContext, useContext, useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import BubbleChartRoundedIcon from "@mui/icons-material/BubbleChartRounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import SettingsApplicationsRoundedIcon from "@mui/icons-material/SettingsApplicationsRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import HistoryIcon from "@mui/icons-material/History";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ApiIcon from '@mui/icons-material/Api';

import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  // useProSidebar,
} from "react-pro-sidebar";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Dashboard from "./components/Dashboard";
import Companies from "./components/Companies";
import Transactions from "./components/Transactions";
import UserList from "./components/User/UserList";
import AddUser, {
  AddUserProvider,
  useAddUser,
} from "./components/User/AddUser";
import CouponHistory from "./components/CouponHistory";
import CouponReport from './components/CouponReport';
import Notifications from "./components/Notifications";
import ManualEntry from "./components/ManualEntry";
import PendingTransactions from "./components/PendingTransactions";
import PageNotFound from "./components/PageNotFound";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import NotifyUsers from "./components/NotifyUsers";
import CreateCoupons from "./components/CreateCoupons";
import CompanyApis from "./components/CompanyApis";

// const Home = () => {
//   return (
//     <>
//       <h1 className="header"> WELCOME </h1>
//       <h3>Bank of the free</h3>
//       <p>Lorem ipsum dolor sit amet...</p>
//     </>
//   );
// };
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [companyId, setCompanyId] = useState("");
  const [token, setToken] = useState("");
  //  const [companylogo,setCompanyLogo] = useState('');
  // const toggleEdit = () => {
  //   setEditmode(!editmode);
  // };

  return (
    <AppContext.Provider value={{ companyId, setCompanyId, token, setToken }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

const App = () => {
  const location = useLocation();
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  // const companylogo =
  //   location.pathname !== "/" && sessionStorage.getItem("logo");
  // console.log("logo from appjs:", companylogo);

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      {location.pathname !== "/" && token && (
        <Sidebar className="position-fixed">
          <Menu>

            {/* <img
              className="logo"
              src={`data:image/jpg;base64,${companylogo}`}
            /> */}

            <MenuItem
              component={<Link to="dashboard" className={`link ${location.pathname === "/dashboard" ? "selected" : ""}`} />}
              icon={<GridViewRoundedIcon />}
            >
              Dashboard
            </MenuItem>

            <MenuItem
              component={<Link to="companies" className={`link ${location.pathname === "/companies" ? "selected" : ""}`} />}
              icon={<WorkspacesIcon />}
            >
              Companies
            </MenuItem>

            <MenuItem
              component={<Link to="companyapis" className={`link ${location.pathname === "/companyapis" ? "selected" : ""}`} />}
              icon={<ApiIcon />}
            >
              Company APIs
            </MenuItem>

            <SubMenu label="Coupons" icon={<WalletRoundedIcon />}>
            <MenuItem
                component={<Link to="createcoupons" className={`link ${location.pathname === "/createcoupons" ? "selected" : ""}`} />}
                icon={<NoteAddIcon />}
              >
                {" "}
                Create Coupons{" "}
              </MenuItem>
              <MenuItem
                component={<Link to="couponhistory" className={`link ${location.pathname === "/couponhistory" ? "selected" : ""}`} />}
                icon={<HistoryIcon />}
              >
                CouponHistory
              </MenuItem>

              <MenuItem
                component={<Link to="couponreport" className={`link ${location.pathname === "/couponreport" ? "selected" : ""}`} />}
                icon={<AssessmentIcon />}
              >
                {" "}
                Coupon Report{" "}
              </MenuItem>

              <MenuItem
                component={<Link to="manualentry" className={`link ${location.pathname === "/manualentry" ? "selected" : ""}`} />}
                icon={<KeyboardIcon />}
              >
                {" "}
                Manual Entry{" "}
              </MenuItem>
            </SubMenu>
            <SubMenu label="Transactions" icon={<MonetizationOnRoundedIcon />}>
              <MenuItem
                component={<Link to="transactions" className={`link ${location.pathname === "/transactions" ? "selected" : ""}`} />}
                icon={<MenuRoundedIcon />}
              >
                List of Transactions
              </MenuItem>
              <MenuItem
                component={<Link to="pendingtransactions" className={`link ${location.pathname === "/pendingtransactions" ? "selected" : ""}`} />}
                icon={<PendingActionsIcon />}
              >
                Pending Transactions
              </MenuItem>
            </SubMenu>

            <SubMenu label="User" icon={<PersonIcon />}>
              <MenuItem
                component={<Link to="userlist" className={`link ${location.pathname === "/userlist" ? "selected" : ""}`} />}
                icon={<PeopleAltIcon />}
              >
                {" "}
                User List{" "}
              </MenuItem>

              <MenuItem
                component={<Link to="adduser" className={`link ${location.pathname === "/adduser" ? "selected" : ""}`} />}
                icon={<PersonAddAltIcon />}
              >
                {" "}
                Add User{" "}
              </MenuItem>
              {/* <MenuItem icon={<ManageAccountsIcon />}> Edit User </MenuItem> */}
            </SubMenu>

            <MenuItem
              component={<Link to="notifications" className={`link ${location.pathname === "/notifications" ? "selected" : ""}`} />}
              icon={<NotificationsNoneIcon />}
            >
              {" "}
              Notifications{" "}
            </MenuItem>
            <MenuItem
              onClick={() => {
                sessionStorage.removeItem("token");
                console.log("token after logout:", token);
                navigate("/");
              }}
              icon={<LogoutRoundedIcon />}
            >
              {" "}
              Logout{" "}
            </MenuItem>
          </Menu>
        </Sidebar>
      )}

      <AppProvider>
        <AddUserProvider>
          <Routes>
            <Route
              path="/"
              element={!token ? <Login /> : <Navigate to="/dashboard" />}
            />

            {token && (
              <Route
                path="/*"
                element={
                  <div>
                    <Sidebar className="position-fixed">
                      {/* ... (your sidebar content) */}
                    </Sidebar>

                    {/* routes */}
                    <section
                      className={
                        "section"
                      }
                    >
                      <Routes>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="companies" element={<Companies />} />
                        <Route path="companyapis" element={<CompanyApis />} />
                        <Route path="transactions" element={<Transactions />} />
                        <Route path="userlist" element={<UserList />} />
                        <Route path="adduser" element={<AddUser />} />
                        <Route
                          path="createcoupons"
                          element={<CreateCoupons />}
                        />
                        <Route
                          path="couponhistory"
                          element={<CouponHistory />}
                        />
                        <Route path="couponreport" element={<CouponReport />} />
                        <Route path="manualentry" element={<ManualEntry />} />
                        <Route
                          path="pendingtransactions"
                          element={<PendingTransactions />}
                        />
                        <Route
                          path="notifications"
                          element={<Notifications />}
                        />
                        <Route path="notifyusers" element={<NotifyUsers />} />
                        
                        <Route path="*" element={<PageNotFound />} />
                      </Routes>
                    </section>
                  </div>
                }
              />
            )}
          </Routes>
        </AddUserProvider>
      </AppProvider>
    </div>
  );
};
export default App;
