import React, { useState, useEffect, useRef } from "react";
import { Constants } from "../constants/credentials";
import "../App.css";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { usePDF } from "react-to-pdf";
import { useDownloadExcel } from "react-export-table-to-excel";
import { useAddUser } from "./User/AddUser";
import Loader from "react-js-loader";
import saveAs from "file-saver";

const ExcelJS = require("exceljs");

const CouponHistory = () => {
  const CompanyId = sessionStorage.getItem('CompanyId');
  const [couponData, setCouponData] = useState([]);
  let heading = [
    "Coupon Id",
    "Coupon Value",
    "Mobile Number",
    "Name",
    "Date-Time",
  ];
  const [mobileNumber, setMobileNumber] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const { toPDF, targetRef } = usePDF({ filename: "coupon-history.pdf" }); //for pdf
  const tableRef = useRef(null); // for excel
  const {setEditmode} = useAddUser();
  setEditmode(false);
  const [showcomponent, setShowComponent] = useState(false); //combo box
  const [loading, setLoading] = useState(false);
  const [companies,setCompanies] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(2);

  function formatDate (input) {
    var datePart = input.match(/\d+/g),
    year = datePart[0], // get only two digits
    month = datePart[1], day = datePart[2];
  
    return day+'-'+month+'-'+year;
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
    getCouponHistory();
  }, []);


  const getCouponHistory = async () => {
    console.log('getCouponHistory is called');
    setLoading(true);
    const token = sessionStorage.getItem('token');
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
        `http://183.83.219.144:81/LMS/Coupon/GetCouponTransactions/${selectedCompany}?mobileNumber=${mobileNumber}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        {
          method: "GET",
          headers: new Headers({
            Authorization: `Bearer ${token}`,
          }),
        }
      );
      const respJson = await resp.json();
      console.log("response: ", respJson);
      setCouponData(respJson);
      

      setLoading(false);
    }
    // }
  };

  const exportExcelFile = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Coupon History");
    sheet.columns = [
      {
        header: "Coupon Id",
        key: "couponId",
        width: 20,
      },
      {
        header: "Coupon Value",
        key: "couponValue",
        width: 15,
      },
      {
        header: "Mobile Number",
        key: "mobileNumber",
        width: 20,
      },
      {
        header: "Name",
        key: "name",
        width: 20,
      },
      {
        header: "Date-Time",
        key: "date",
        width: 20,
      },
    ];
    const promise = Promise.all(
      couponData?.map(async (coupon) => {
        // const rowNumber = index + 1;
        sheet.addRow({
          couponId: coupon.couponIdentity,
          couponValue: coupon.faceValue,
          mobileNumber: coupon.registerMobileNumber,
          name: coupon.registerName,
          date: formatDate(coupon.changeDate.split("T")[0]) +", "+coupon.changeDate.split("T")[1].split('.')[0],
        });
      })
    );
    promise.then(() => {
      console.log("pormise:", promise);
    });

    const faceValueColumn = sheet.getColumn("couponValue");
    faceValueColumn.alignment = { horizontal: "center" };

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Coupon History.xlsx");
    });
  };


  const handleComboSubmit = async () => {
    console.log("Selected Company: ", selectedCompany);
    // setLoading(true);
    // const token = sessionStorage.getItem("token");
    // if (token) {
    //   const resp = await fetch(
    //     `http://183.83.219.144:81/LMS/Company/Companies/${selectedCompany}`,
    //     {
    //       method: "GET",
    //       headers: new Headers({
    //         Authorization: `Bearer ${token}`,
    //       }),
    //     }
    //   );
    //   const respJson = await resp.json();
    //   // setCompanies(respJson);
    //   console.log('combobox response:',respJson);
    //   setLoading(false);
    // }

    setShowComponent(true);
  };

  return (

        <div>
      <h4 className="header mb-4 font-weight-bold">Coupon History</h4>
      <div>
        <div className="d-flex align-items-center my-3 ">
          <div className="d-flex flex-direction-row align-items-center" >
          <label className="mb-0 mr-2"  >Company: </label>
            <select
            className="form-control coupon_history_dropdown"
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
              </div>
            <label className="mb-0 mx-2">Mobile Number:</label>
          <input
            className="form-control ml-2 "
            
            style={{ margin: 10,width:'150px',fontSize:'10px' }}
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Mobile Number"
          />
          <br />
          <label className="mb-0 mr-2">Start Date:</label>
          <DatePicker
           wrapperClassName={"dp-width"}
            className="form-control dp-width"
            selected={startDate}
            dateFormat="dd/MM/yyyy"
            onChange={(date) => setStartDate(date)}
          />
          <label className="mb-0 mr-2 ml-2">End Date:</label>
          <DatePicker
           wrapperClassName={"dp-width"}
            className="form-control dp-width"
            selected={endDate}
            dateFormat="dd/MM/yyyy"
            onChange={(date) => setEndDate(date)}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{ margin: 10 }}
            onClick={getCouponHistory}
            >
            Submit
          </button>
            </div>

        {couponData?.length != 0 ? (
          <div>
            <div ref={targetRef}>
              <table className="table  table-striped" ref={tableRef}>
                <thead style={{ padding: 20, backgroundcolor: "red" }}>
                  <tr>
                    {heading.map((head, headID) => (
                      <th key={headID}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!couponData.message && couponData
                    ?.sort((a, b) => b.changeDate.localeCompare(a.changeDate))
                    ?.map((coupon) => (
                      <tr>
                        <td className="coupon">{coupon.couponIdentity}</td>
                        <td className="coupon">{coupon.faceValue}</td>
                        <td className="coupon">
                          {coupon.registerMobileNumber}
                        </td>
                        <td className="coupon"> {coupon.registerName}</td>
                        <td className="coupon">
                          {formatDate(coupon.changeDate.replace("T", " ").split(" ")[0])}
                          {' '}
                          {coupon.changeDate.split("T")[1].split('.')[0]}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div>
              <button className="btn btn-secondary mb-2" onClick={exportExcelFile}>
                {" "}
                Export to Excel{" "}
              </button>
              <button
                className="btn btn-secondary mb-2 mx-2"
                onClick={() => toPDF()}
              >
                Download PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="d-flex align-items-center justify-content-center" style={{height:'69vh'}}>
          <p>No records found</p>
          </div>
        )}
      </div>
      </div>

  );
};

export default CouponHistory;
