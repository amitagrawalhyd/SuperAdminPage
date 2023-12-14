import React, { useState, useEffect, useRef } from "react";
  import "../App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { usePDF } from "react-to-pdf";
import { useAddUser } from "./User/AddUser";
import saveAs from "file-saver";
import Loader from "react-js-loader";
const ExcelJS = require("exceljs");


const CouponReport = () => {
  const CompanyId = sessionStorage.getItem("CompanyId");
  const [couponReport, setCouponReport] = useState([]);
  let heading = ["Coupon Id", "Coupon Value", "Created date", "Expiry date"];
  const [loading, setLoading] = useState(false);

  // const [mobileNumber, setMobileNumber] = useState("");
  const mobileNumber = sessionStorage.getItem("mobileNumober");

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const { toPDF, targetRef } = usePDF({ filename: "coupon-history.pdf" }); //for pdf
  const tableRef = useRef(null); // for excel
  const { setEditmode } = useAddUser();
  setEditmode(false);
  const [activeTab, setActiveTab] = useState("createdCoupons");
  const [showcomponent, setShowComponent] = useState(false); //combo box
  const [companies,setCompanies] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(2);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  function formatDate(input) {
    var datePart = input.match(/\d+/g),
      year = datePart[0], // get only two digits
      month = datePart[1],
      day = datePart[2];

    return day + "-" + month + "-" + year;
  }

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

  useEffect(() => {
    
    getCouponReport();

  }, []);

  const getCouponReport = async () => {
    console.log("getCouponReport is called");
    setLoading(true);
    // if (!getDataCalled) {
    // getDataCalled = true;
    const token = sessionStorage.getItem("token");
    const companyId = sessionStorage.getItem("CompanyId");

    if (token) {
      const res = await fetch(
        `http://183.83.219.144:81/LMS/Company/Companies/${companyId}`,
        {
          method: 'GET',
          headers: new Headers({
            Authorization: `Bearer ${token}`,
          }),
        },
      );
      const data = await res.json();
  setCompanies(data);

      const resp = await fetch(
        `http://183.83.219.144:81/LMS/Coupon/CouponReport/${selectedCompany}/${mobileNumber}/${formattedStartDate}/${formattedEndDate}`,
        {
          method: "GET",
          headers: new Headers({
            Authorization: `Bearer ${token}`,
          }),
        }
      );
      //setData(resp.json());
      //console.log('data length: ', data.length);
      const respJson = await resp.json();
      console.log("response: ", respJson);
      setCouponReport(respJson);
      setLoading(false);
    }
    // }
  };

  const exportExcelFile = () => {
    const workbook = new ExcelJS.Workbook();
    const createdSheet = workbook.addWorksheet("Created Coupons");
    createdSheet.columns = [
      {
        header: "Coupon Id",
        key: "couponId",
        width: 20,
      },
      {
        header: "Coupon Value",
        key: "couponValue",
        width: 20,
      },
      {
        header: "Created date",
        key: "createdDate",
        width: 20,
      },
      {
        header: "Expiry date",
        key: "expiryDate",
        width: 20,
      },
    ];
    // console.log('registrations before export:',registrations);

    const createdPromise = Promise.all(
      couponReport?.createdCoupons
        ?.sort((a, b) => b.createdDate.localeCompare(a.createdDate))
        ?.map(async (coupon) => {
          // const rowNumber = index + 1;
          createdSheet.addRow({
            couponId: coupon.couponId,
            couponValue: coupon.faceValue,
            createdDate: `${formatDate(
              coupon.createdDate.replace("T", " ").split(" ")[0]
            )}, ${coupon.createdDate.split("T")[1].split(".")[0]}`,
            expiryDate: `${formatDate(
              coupon.expiryDate.replace("T", " ").split(" ")[0]
            )}, ${coupon.expiryDate.split("T")[1].split(".")[0]}`,
          });
          // return(registrations);
        })
    );
    createdPromise.then(() => {
      console.log("promise:", createdPromise);
    });

    const expiringSheet = workbook.addWorksheet("Expiring Coupons");
    expiringSheet.columns = [
      {
        header: "Coupon Id",
        key: "couponId",
        width: 20,
      },
      {
        header: "Coupon Value",
        key: "couponValue",
        width: 20,
      },
      {
        header: "Created date",
        key: "createdDate",
        width: 20,
      },
      {
        header: "Expiry date",
        key: "expiryDate",
        width: 20,
      },
    ];
    // console.log('registrations before export:',registrations);

    const expiringPromise = Promise.all(
      couponReport?.expiringCoupons
        ?.sort((a, b) => b.createdDate.localeCompare(a.createdDate))
        ?.map(async (coupon) => {
          // const rowNumber = index + 1;
          expiringSheet.addRow({
            couponId: coupon.couponId,
            couponValue: coupon.faceValue,
            createdDate: `${formatDate(
              coupon.createdDate.replace("T", " ").split(" ")[0]
            )}, ${coupon.createdDate.split("T")[1].split(".")[0]}`,
            expiryDate: `${formatDate(
              coupon.expiryDate.replace("T", " ").split(" ")[0]
            )}, ${coupon.expiryDate.split("T")[1].split(".")[0]}`,
          });
          // return(registrations);
        })
    );
    expiringPromise.then(() => {
      console.log("promise:", expiringPromise);
    });

    const expiredSheet = workbook.addWorksheet("Expired Coupons");
    expiredSheet.columns = [
      {
        header: "Coupon Id",
        key: "couponId",
        width: 20,
      },
      {
        header: "Coupon Value",
        key: "couponValue",
        width: 20,
      },
      {
        header: "Created date",
        key: "createdDate",
        width: 20,
      },
      {
        header: "Expiry date",
        key: "expiryDate",
        width: 20,
      },
    ];
    // console.log('registrations before export:',registrations);

    const expiredPromise = Promise.all(
      couponReport?.expiredCoupons
        ?.sort((a, b) => b.createdDate.localeCompare(a.createdDate))
        ?.map(async (coupon) => {
          // const rowNumber = index + 1;
          expiredSheet.addRow({
            couponId: coupon.couponId,
            couponValue: coupon.faceValue,
            createdDate: `${formatDate(
              coupon.createdDate.replace("T", " ").split(" ")[0]
            )}, ${coupon.createdDate.split("T")[1].split(".")[0]}`,
            expiryDate: `${formatDate(
              coupon.expiryDate.replace("T", " ").split(" ")[0]
            )}, ${coupon.expiryDate.split("T")[1].split(".")[0]}`,
          });
          // return(registrations);
        })
    );
    expiredPromise.then(() => {
      console.log("promise:", expiredPromise);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Coupon Report.xlsx");
    });
  };

  return (

        <div>
          <h4 className="header mb-4  font-weight-bold">
            Coupon Report
          </h4>
          <div>
            <div className="d-flex align-items-center ">
            <label className="mb-0 mr-2">Company:</label>
            <select
            className="form-control user_list_drop_down mr-2"
              name="dropdown"
              onChange={(event) => {
                setSelectedCompany(event.target.value);
                console.log('dropdown changed to ',event.target.value);
              }}
            >
              {!companies.message && (
                <>
                  {/* <option value="All">All</option> */}
                  {companies
                  ?.filter((company) => company.isActive === true)
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
                type="button"
                className="btn btn-primary"
                style={{ margin: 10 }}
                onClick={getCouponReport}
              >
                Submit
              </button>
            </div>
            <div className="d-flex justify-content-around my-4">
              <div className="w-100">
                {typeof couponReport.createdCoupons !== "undefined" && (
                  <div className="box box_main d-flex">

                        <div className="created_box">
                          <p> CREATED COUPONS</p>
                          <h3 style={{ fontSize: 34, textAlign: "center" }}>
                            {couponReport?.createdCoupons[0]?.createdCount
                              ? couponReport?.createdCoupons[0]?.createdCount
                              : 0}</h3>
                        </div>
                        <div className="created_box">
                          <p> EXPIRING COUPONS</p>
                          <h3 style={{ fontSize: 34, textAlign: "center" }}>
                            {couponReport?.expiringCoupons[0]?.expiringCount
                              ? couponReport?.expiringCoupons[0]?.expiringCount
                              : 0}</h3>
                        </div>
                        <div className="created_box">
                          <p> EXPIRED COUPONS</p>
                          <h3 style={{ fontSize: 34, textAlign: "center" }}>
                            {couponReport?.expiredCoupons[0]?.expiredCount
                              ? couponReport?.expiredCoupons[0]?.expiredCount
                              : 0}</h3>
                        </div>

                  </div>
                )}
              </div>
            </div>

            <ul className="nav nav-tabs">
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeTab === "createdCoupons" && "active"
                  }`}
                  onClick={() => handleTabChange("createdCoupons")}
                >
                  Created Coupons
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeTab === "expiringCoupons" && "active"
                  }`}
                  onClick={() => handleTabChange("expiringCoupons")}
                >
                  Expiring Coupons
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeTab === "expiredCoupons" && "active"
                  }`}
                  onClick={() => handleTabChange("expiredCoupons")}
                >
                  Expired Coupons
                </a>
              </li>
            </ul>

            {activeTab === "createdCoupons" && (
              <div>
                {typeof couponReport.createdCoupons !== "undefined" &&
                couponReport.createdCoupons.length > 0 ? (
                  <div>
                    <div ref={targetRef}>
                      <table
                        className="table mt-3 table-striped"
                        ref={tableRef}
                      >
                        <thead style={{ padding: 20, backgroundcolor: "red" }}>
                          <tr>
                            {heading.map((head, headID) => (
                              <th key={headID}>{head}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {!couponReport.message &&
                            couponReport.createdCoupons
                              ?.sort((a, b) =>
                                b.createdDate.localeCompare(a.createdDate)
                              )
                              ?.map((coupon) => (
                                <tr>
                                  <td className="coupon">{coupon.couponId}</td>
                                  <td className="coupon">{coupon.faceValue}</td>
                                  <td className="coupon">
                                    {formatDate(
                                      coupon.createdDate
                                        .replace("T", " ")
                                        .split(" ")[0]
                                    )}{" "}
                                    {
                                      coupon.createdDate
                                        .split("T")[1]
                                        .split(".")[0]
                                    }
                                  </td>
                                  <td className="coupon">
                                    {formatDate(
                                      coupon.expiryDate
                                        .replace("T", " ")
                                        .split(" ")[0]
                                    )}{" "}
                                    {
                                      coupon.expiryDate
                                        .split("T")[1]
                                        .split(".")[0]
                                    }
                                  </td>
                                </tr>
                              ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center my-3"
                    // style={{ height: "69vh" }}
                  >
                    <p>No records found</p>
                  </div>
                )}
              </div>
            )}
            {/* Expiring Coupons */}
            {activeTab === "expiringCoupons" && (
              <div>
                {typeof couponReport.expiringCoupons !== "undefined" &&
                couponReport.expiringCoupons.length > 0 ? (
                  <div>
                    <div ref={targetRef}>
                      <table
                        className="table mt-3 table-striped"
                        ref={tableRef}
                      >
                        <thead style={{ padding: 20, backgroundcolor: "red" }}>
                          <tr>
                            {heading.map((head, headID) => (
                              <th key={headID}>{head}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {!couponReport.message &&
                            couponReport.expiringCoupons
                              ?.sort((a, b) =>
                                b.createdDate.localeCompare(a.createdDate)
                              )
                              ?.map((coupon) => (
                                <tr>
                                  <td className="coupon">{coupon.couponId}</td>
                                  <td className="coupon">{coupon.faceValue}</td>
                                  <td className="coupon">
                                    {formatDate(
                                      coupon.createdDate
                                        .replace("T", " ")
                                        .split(" ")[0]
                                    )}{" "}
                                    {
                                      coupon.createdDate
                                        .split("T")[1]
                                        .split(".")[0]
                                    }
                                  </td>
                                  <td className="coupon">
                                    {formatDate(
                                      coupon.expiryDate
                                        .replace("T", " ")
                                        .split(" ")[0]
                                    )}{" "}
                                    {
                                      coupon.expiryDate
                                        .split("T")[1]
                                        .split(".")[0]
                                    }
                                  </td>
                                </tr>
                              ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center my-3"
                    // style={{ height: "69vh" }}
                  >
                    <p>No records found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "expiredCoupons" && (
              <div>
                {typeof couponReport.expiredCoupons !== "undefined" &&
                couponReport.expiredCoupons.length > 0 ? (
                  <div>
                    <div ref={targetRef}>
                      <table
                        className="table mt-3 table-striped"
                        ref={tableRef}
                      >
                        <thead style={{ padding: 20, backgroundcolor: "red" }}>
                          <tr>
                            {heading.map((head, headID) => (
                              <th key={headID}>{head}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {!couponReport.message &&
                            couponReport.expiredCoupons
                              ?.sort((a, b) =>
                                b.createdDate.localeCompare(a.createdDate)
                              )
                              ?.map((coupon) => (
                                <tr>
                                  <td className="coupon">{coupon.couponId}</td>
                                  <td className="coupon">{coupon.faceValue}</td>
                                  <td className="coupon">
                                    {formatDate(
                                      coupon.createdDate
                                        .replace("T", " ")
                                        .split(" ")[0]
                                    )}{" "}
                                    {
                                      coupon.createdDate
                                        .split("T")[1]
                                        .split(".")[0]
                                    }
                                  </td>
                                  <td className="coupon">
                                    {formatDate(
                                      coupon.expiryDate
                                        .replace("T", " ")
                                        .split(" ")[0]
                                    )}{" "}
                                    {
                                      coupon.expiryDate
                                        .split("T")[1]
                                        .split(".")[0]
                                    }
                                  </td>
                                </tr>
                              ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center my-3"
                    // style={{ height: "69vh" }}
                  >
                    <p>No records found</p>
                  </div>
                )}
              </div>
            )}
          </div>
          {(typeof couponReport.createdCoupons !== "undefined" &&
            couponReport.createdCoupons.length > 0 &&
            typeof couponReport.expiringCoupons !== "undefined" &&
            couponReport.expiringCoupons.length > 0) ||
            (typeof couponReport.expiredCoupons !== "undefined" &&
              couponReport.expiredCoupons.length > 0 && (
                <div>
                  <button
                    className="btn btn-secondary mb-2"
                    onClick={exportExcelFile}
                  >
                    Export to Excel
                  </button>
                  {/* <button
                className="btn btn-secondary mb-2 mx-2"
                onClick={() => toPDF()}
              >
                Download PDF
              </button> */}
                </div>
              ))}
        </div>
     
  );
};

export default CouponReport;
