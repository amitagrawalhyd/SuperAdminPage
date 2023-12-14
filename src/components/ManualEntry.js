import React, { useState, useEffect } from "react";
import { Constants } from "../constants/credentials";
import Cookies from "js-cookie";
import { useAddUser } from "./User/AddUser";
import Loader from 'react-js-loader';

const ManualEntry = () => {
  const [couponCode, setCouponCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const CompanyId = sessionStorage.getItem('CompanyId');
  const token = sessionStorage.getItem('token');
  const {setEditmode} = useAddUser();
  const [loading, setLoading] = useState(false);
  const [showcomponent, setShowComponent] = useState(false); //combo box
  const [companies,setCompanies] = useState([]);
  const [validMobile, setValidMobile] = useState(true); // New state to track mobile number validation


  const [selectedCompany, setSelectedCompany] = useState(2); 
  // const [selectedCompany, setSelectedCompany] = useState(companies && companies.length > 0 ? companies[0].companyId : "");

  setEditmode(false);

  const validateMobileNumber = (value) => {
    const mobileRegex = /^[0-9]{10}$/; 
    return mobileRegex.test(value);
  };

  const handleMobileNumberChange = (e) => {
    const newValue = e.target.value;
    setMobileNumber(newValue);

    const isMobileValid = validateMobileNumber(newValue);
    setValidMobile(isMobileValid);
  };

  useEffect(() => {
    getCompanies();
  }, []);

  const getCompanies = async () => {
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
      setLoading(false);
    }
  };


  function handleSubmit(event) {
    event.preventDefault();
    
    // Validate mobile number
    const isMobileValid = validateMobileNumber(mobileNumber);
    setValidMobile(isMobileValid);

    if (!isMobileValid) {
      // Mobile number is not valid, you can show an error message or take appropriate action
      return;
    }

    setLoading(true);
    fetch(
      `http://183.83.219.144:81/LMS/Coupon/ConsumeManualCoupon/${selectedCompany}/${couponCode}/${mobileNumber}`,
      {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      }
    )
      .then((response) => response.json())
      .then((responseData) => {
        console.log("manual entry coupon response:", responseData);
        if (responseData === true) {
          alert("Coupon Code posted successfully");
        } else if (responseData === false) {
          alert("Coupon code already used or invalid");
        } else {
          alert("Invalid Coupon Code:(");
        }
        setLoading(false);
      })
      .catch((error) => console.log(error));
  }

  return (

    <div className="manual-entry-container">
      <div className="manual-entry-form">
        <h4 className="header mb-2 text-center font-weight-bold">Manual Entry</h4>
        <form onSubmit={handleSubmit} className="form_transaction ">
        <div className="d-flex flex-direction-row align-items-center mb-1">
          <label className="mb mr-2 ml-3">Company:</label>
            <select
            className="form-control user_list_drop_down"
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

          <div >
            <label className="mb-0 ml-3">Mobile Number:</label>
            <input
              className={`form-control mx-auto ${!validMobile ? 'is-invalid' : ''}`}
              type="text"
              value={mobileNumber}
              onChange={handleMobileNumberChange}
            />
            {!validMobile && <div className="invalid-feedback form-error ml-3">Please enter a valid mobile number.</div>}
          </div>
          
          <div >
            <label className="mb-0 ml-3">Coupon Id:</label>
            <input
              className="form-control mx-auto  "
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
          </div>


          <button
            className="btn btn-primary"
            style={{
              alignSelf: "flex-end",
              position: "absolute",
              bottom: 0,
              right:0,
              margin: 10,
              border: 0,
            }}
            type="submit"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManualEntry;
