import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAddUser } from "./User/AddUser";
import DatePicker from "react-datepicker";
import Loader from "react-js-loader";
import Combo from "./Combo";

const PendingTransactons = () => {
  const token = sessionStorage.getItem("token");
  const [pendingtransactions, setPendingTransactions] = useState([]);
  let heading = [
    "Select",
    "Amount",
    "Name",
    "Mobile Number",
    "UPI ID",
    "Status",
    "Date",
  ];
  const [allchecked, setAllChecked] = React.useState([]);
  const mobileNumber = sessionStorage.getItem("mobileNumber");
  // const [selectAll,setSelectAll] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [usernumbers, setUserNumbers] = useState([]);
  const lastWeekStartDate = new Date(); // last week date as default date
  lastWeekStartDate.setDate(lastWeekStartDate.getDate() - 7);
  const [startDate, setStartDate] = useState(lastWeekStartDate); // Set the default value for startDate
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showcomponent, setShowComponent] = useState(false); //combo box
  const { setEditmode } = useAddUser();
  const [companies, setCompanies] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(2);
  setEditmode(false);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(pendingtransactions.map((item) => item));
    }
    setSelectAll(!selectAll);
  };
  console.log("selected items:", selectedItems);

  const handleCheckboxChange = (transaction) => {
    if (selectedItems.includes(transaction)) {
      setSelectedItems(selectedItems.filter((item) => item !== transaction));
    } else {
      setSelectedItems([...selectedItems, transaction]);
    }
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

  const handleComplete = async () => {
    setLoading(true);
    const completeTransations = await Promise.all(
      selectedItems.map(async (transaction) => {
        const response = await fetch(
          `http://183.83.219.144:81/LMS/Coupon/CreatePayout/${selectedCompany}/${
            transaction.id
          }/${transaction.upiAddress}/${transaction.payoutFundAccountId}/${
            transaction.transactionAmount * 100
          }`,
          {
            method: "POST",
            headers: new Headers({
              Authorization: `Bearer ${token}`,
            }),
          }
        );
        return await response.json();
      })
    );
    // navigate("/pendingtransactions");
    // window.location.reload();
    const completeFailed = completeTransations.some((response) => !response);
    console.log("notification status:", completeFailed);

    if (completeFailed) {
      alert("Failed to complete some transactions.");
    } else {
      alert("Transaction(s) completed successfully.");
    }
    getPendingTransactions();
    setLoading(false);
    setSelectedItems([]);
    console.log("complete api response:", completeTransations);
  };

  const getPendingTransactions = async () => {
    setLoading(true);
    //for total transactions list
    const companyId = sessionStorage.getItem("CompanyId");
    const res = await fetch(
      `http://183.83.219.144:81/LMS/Company/Companies/${companyId}`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      }
    );
    const data = await res.json();
    setCompanies(data);

    const resp = await fetch(
      `http://183.83.219.144:81/LMS/Coupon/GetPendingTransactions/${selectedCompany}/${mobileNumber}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      }
    );
    const respJson = await resp.json();
    setPendingTransactions(respJson);
    setLoading(false);
  };

  useEffect(() => {
    console.log("useEffect is running");
    console.log("State:", {
      pendingtransactions,
      selectAll,
      startDate,
      endDate,
    });
    if (selectedCompany) {
      getPendingTransactions();
    }
    // getUserDetails();
  }, []);

  console.log("checked values", allchecked);

  return (

        <div className="">
          <h4 className="header mb-4 font-weight-bold">Pending Transactions</h4>
          {/* <input value="selectAll" type="checkbox" onChange={handleSelectAll} />  */}
          <div className="d-flex align-items-center justify-content-around mb-3">
            <label className="d-flex align-items-center mb-0">
              <input
                // style={{ marginLeft: 5, marginRight: 5 }}
                className="mr-2 form-input-checkbox custom-checkbox"
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
              />
              Select All
            </label>
            <button
              style={{
                color: "white",
                padding: 5,
                borderRadius: 5,
                backgroundColor: selectedItems.length === 0 ? "grey" : "blue",
                border: 0,
                cursor: selectedItems.length === 0 ? "not-allowed" : "pointer",
                marginRight: 10,
              }}
              disabled={selectedItems.length === 0}
              onClick={handleComplete}
            >
              Complete
            </button>

            <div className="d-flex flex-direction-row align-items-center">
              <label className="mb-0 mr-2">Company: </label>
              <select
                className="form-control transaction_dropdown "
                name="dropdown"
                onChange={(event) => {
                  setSelectedCompany(event.target.value);
                  console.log("dropdown changed to ", event.target.value);
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

            <label className="mb-0 mx-2">Start Date:</label>
            <DatePicker
              wrapperClassName="dp-width"
              className="form-control "
              selected={startDate}
              dateFormat="dd/MM/yyyy"
              onChange={(date) => setStartDate(date)}
            />
            <label className="mb-0 mx-2">End Date:</label>
            <DatePicker
              wrapperClassName="dp-width"
              className="form-control"
              selected={endDate}
              dateFormat="dd/MM/yyyy"
              onChange={(date) => setEndDate(date)}
            />

            <button
              type="button"
              className="btn btn-primary ml-2"
              // style={{ margin: 10 }}
              onClick={getPendingTransactions}
            >
              Submit
            </button>
          </div>
          <div>
            <table className="table  table-striped">
              <thead style={{ padding: 20 }}>
                {pendingtransactions?.length !== 0 ? (
                  <tr>
                    {heading.map((head, headID) => (
                      <th key={headID}>{head}</th>
                    ))}
                  </tr>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ height: "69vh" }}
                  >
                    <p>No records found</p>
                  </div>
                )}
              </thead>
              <tbody>
                {!pendingtransactions.message &&
                  pendingtransactions
                    ?.sort(
                      (a, b) =>
                        new Date(
                          ...a.transactionDate.split("T")[0].split("-")
                        ) -
                        new Date(...b.transactionDate.split("T")[0].split("-"))
                    )
                    ?.map((transaction) => (
                      <tr>
                        {/* <td> <input value={transaction.id} type = "checkbox" onChange = {handleChange} /> </td> */}
                        <td>
                          <input
                            type="checkbox"
                            className="form-input-checkbox custom-checkbox"
                            checked={selectedItems.includes(transaction)}
                            onChange={() => handleCheckboxChange(transaction)}
                          />{" "}
                        </td>
                        <td className="coupon">
                          {transaction.transactionAmount}
                        </td>
                        <td className="coupon">{transaction.registerName}</td>
                        <td className="coupon">
                          {transaction.registerMobileNumber}
                        </td>
                        <td className="coupon"> {transaction.upiAddress}</td>
                        <td className="transaction">
                          {transaction.isPaid &&
                            transaction.isActive &&
                            "Completed"}
                          {!transaction.isPaid &&
                            transaction.isActive &&
                            "Pending"}
                          {!transaction.isPaid &&
                            !transaction.isActive &&
                            "Rejected"}
                        </td>
                        <td className="coupon">
                          {formatDate(
                            transaction.transactionDate.split("T")[0]
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

  );
};

export default PendingTransactons;
