import "../App.css";
import React, { useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { Constants } from "../constants/credentials";
import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

import { getCurrentDate } from "../components/currentDate";
import Loader from "react-js-loader";
import { useSearchParams, useLocation } from "react-router-dom";
import { useAppContext } from "../App";
import { useAddUser } from "./User/AddUser";
import { getToken } from "./User/UserList";
import Combo from "./Combo";
import { getCompanies } from "../APIs/GetCompanies";


var isEmpty = require("lodash.isempty");

const Dashboard = () => {
  const currentDate = getCurrentDate();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const CompanyId = sessionStorage.getItem("CompanyId");
  const token = sessionStorage.getItem("token");
  // const { token } = useAppContext();
  const [showcomponent, setShowComponent] = useState(false); //combo box
  
  // console.log('companies from dashboard:',selectedCompany);
  const mobileNumber = sessionStorage.getItem("mobileNumber");
  const [dashboardDetails, setDashboardDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { setEditmode } = useAddUser();
  setEditmode(false);

  // const companiesData = sessionStorage.getItem('companies') ;
  // const companies = JSON.parse(companiesData);
  const [companies,setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(2);
  
  function formatStartDate(separator = "-") {
    let date = startDate.getDate();
    let month = startDate.getMonth() + 1;
    let year = startDate.getFullYear();
    return `${year}${separator}${
      month < 10 ? `0${month}` : `${month}`
    }${separator}${date}`;
  }
  const formattedStartDate = startDate && formatStartDate();
  function formatEndDate(separator = "-") {
    let date = endDate.getDate();
    let month = endDate.getMonth() + 1;
    let year = endDate.getFullYear();
    return `${year}${separator}${
      month < 10 ? `0${month}` : `${month}`
    }${separator}${date}`;
  }
  const formattedEndDate = endDate && formatEndDate();


  const decodedToken = atob(token);


  const getDashboardDetails = async () => {
    const companyId = sessionStorage.getItem("CompanyId");
    console.log("dashboard details called");
console.log('dropdown company:',selectedCompany)
    setLoading(true);
    const resp = await fetch(
      `http://183.83.219.144:81/LMS/Coupon/CouponSummary/${selectedCompany}/${mobileNumber}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${getToken()}`,
        }),
      }
    ).catch((error) => console.log(error));
    const respJson = await resp.json();
    setDashboardDetails(respJson);

    const res = await fetch(
      `http://183.83.219.144:81/LMS/Company/Companies/${companyId}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: `Bearer ${getToken()}`,
        }),
      },
    );
    const data = await res.json();
setCompanies(data);
    setLoading(false);
  };

  useEffect(() => {
    // getCompanyDetails();
      // Call the function that needs to execute after selectedCompany has a value
      getDashboardDetails();
  }, []);

  // console.log('selected dropdown:',selected)

  return (
    <>
      {loading ? (
        <div style={{display:"flex",alignItems:'center',justifyContent:'center',height:'85vh'}}>
        <Loader bgColor={"#16210d"} type="spinner-cub"/>
        </div>
      ) : (
        <div>
          <h4 className="font-weight-bold mb-4">Dashboard</h4>
          <div className="dashboard-form">
          <label className="mb-0 mr-2 ">Company:</label>
            <select
            className="form-control user_list_drop_down mr-2"
              name="dropdown"
              onChange={(event) => {
                setSelectedCompany(event.target.value);
                console.log('dropdown changed to ',event.target.value);
              }}
            >
              {!companies?.message && (
                <>
                  {/* <option value="All">All</option> */}
                  {companies?.
                  filter((company) => company.isActive === true)
                  ?.map((company) => (
                    <option
                      key={company.companyName}
                      value={company.companyId}
                    >
                      {company.companyName}
                    </option>
                  ))}
                </>
              )}
            </select>
            <label className="mb-0 mr-2">Start Date:</label>
            <DatePicker
              className="form-control"
              selected={startDate}
              dateFormat="dd/MM/yyyy"
              onChange={(date) => setStartDate(date)}
            />
            <label className="mb-0 mr-2 ml-2">End Date:</label>
            <DatePicker
              className="form-control"
              selected={endDate}
              dateFormat="dd/MM/yyyy"
              onChange={(date) => setEndDate(date)}
            />



            <button
              onClick={getDashboardDetails}
              className="btn btn-primary"
              style={{ margin: 10 }}
            >
              Submit
            </button>
          </div>

          <div className="dashboard-details">
            <div>
              <div className="d-flex justify-content-around mt-5">
                {!isEmpty(dashboardDetails) &&
                  typeof dashboardDetails.scannedCoupons !== "undefined" && (
                    <div className="scanned-container box">
                      <>
                        <div
                          style={{
                            color: "#555",
                            marginBottom: 5,
                            borderBottom: "1px solid #ddd",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <p style={{padding: '8px 0px',fontWeight:500,}}>SCANNED COUPONS</p>
                        </div>

                        <table>
                          <>
                            <th style={{ padding: "0 10px" }}>Face Value</th>
                            <th style={{ padding: "0 10px" }}>Count</th>
                            <th style={{ padding: "0 10px" }}>Amount</th>
                          </>
                          <tbody>
                            {typeof dashboardDetails.scannedCoupons !==
                              "undefined" &&
                            dashboardDetails.scannedCoupons.length > 0 ? (
                              dashboardDetails?.scannedCoupons.map((coupon) => (
                                <tr>
                                  <td style={{ textAlign: "center" }}>
                                    {" "}
                                    {coupon?.faceValue}
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    {" "}
                                    {coupon?.scannedCount}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: "right",
                                      paddingRight: "10px",
                                    }}
                                  >
                                    {coupon?.faceValue * coupon?.scannedCount}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td style={{ textAlign: "center" }}> 0</td>
                                <td style={{ textAlign: "center" }}> 0</td>
                                <td
                                  style={{
                                    textAlign: "right",
                                    paddingRight: "10px",
                                  }}
                                >
                                  {" "}
                                  0
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </>
                    </div>
                  )}
                {!isEmpty(dashboardDetails) &&
                  typeof dashboardDetails.expiredCoupons !== "undefined" && (
                    <div className="expired-container box">
                          <p style={{padding: '8px 0px',fontWeight:500, textAlign:'center',borderBottom:'1px solid #ddd'}}>EXPIRED COUPONS</p>

                      <table>
                        {/* {dashboardDetails.expiredCoupons.length !== 0 && ( */}
                        <>
                          <th style={{ padding: "0 10px" }}>Face Value</th>
                          <th style={{ padding: "0 10px" }}>Count</th>
                          <th style={{ padding: "0 10px" }}>Amount</th>
                        </>
                        {/* )} */}
                        <tbody>
                          {typeof dashboardDetails.expiredCoupons !==
                            "undefined" &&
                          dashboardDetails.expiredCoupons.length > 0 ? (
                            dashboardDetails?.expiredCoupons.map((coupon) => (
                              <tr>
                                <td style={{ textAlign: "center" }}>
                                  {" "}
                                  {coupon?.faceValue}
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  {" "}
                                  {coupon?.expiredCount}
                                </td>
                                <td
                                  style={{
                                    textAlign: "right",
                                    paddingRight: "10px",
                                  }}
                                >
                                  {" "}
                                  {coupon?.faceValue * coupon?.expiredCount}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td style={{ textAlign: "center" }}> 0</td>
                              <td style={{ textAlign: "center" }}> 0</td>
                              <td
                                style={{
                                  textAlign: "right",
                                  paddingRight: "10px",
                                }}
                              >
                                {" "}
                                0
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                <div>
                  {typeof dashboardDetails.transaction !== "undefined" && (
                    // <div className="created_box">
                    //   <table >
                    //     <>
                    //       <th>
                    //         TRANSFERRED AMOUNT
                    //       </th>
                    //     </>
                    //     <tbody>
                    //       <tr>
                    //         <td>
                    //           {dashboardDetails?.transaction?.transactionAmount}
                    //         </td>
                    //       </tr>
                    //     </tbody>
                    //   </table>
                    // </div>
                                     <div className="created_box">
                                     <p>TRANSFERRED AMOUNT</p>
                                     <h3 style={{ fontSize: 34, textAlign: "center" }}>
                                     {dashboardDetails?.transaction?.transactionAmount}</h3>
                                   </div>

                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
  );
};

export default Dashboard;
