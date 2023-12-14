import React, { useState, useEffect, createContext, useContext, cloneElement } from "react";
import { Constants } from "../../constants/credentials";
import Cookies from "js-cookie";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import { create } from "@mui/material/styles/createTransitions";
// import { getUsers } from "../../APIs/getUsers";
import { useInitialValues, useAddUser } from "./AddUser";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import saveAs from "file-saver";
import Loader from "react-js-loader";
import Combo from "../Combo";
import { QrCodeScannerOutlined } from "@mui/icons-material";
const ExcelJS = require("exceljs");

export const getToken = () => {
  const token = sessionStorage.getItem("token");
  return token;
};

export default function UserList() {
  const [registrations, setRegistrations] = useState([]); // users
  let heading = ["Mobile Number", "Name", "City", "User type", "Actions"];
  const options = ["All", "Company", "Distributer", "Dealer", "Mechanic"]; //for dropdown
  const defaultOption = options[0]; //dropdown menu default option
  const [selected, setSelected] = useState(""); // Define 'selected' here
  const { setEditmode, setEditValues } = useAddUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationtypes, setRegistrationTypes] = useState([]); 
  const [showcomponent, setShowComponent] = useState(false); //combo box
  // const companiesData = sessionStorage.getItem('companies') ;
  const [companies,setCompanies] = useState([]); 
  const [selectedCompany, setSelectedCompany] = useState(2);

  setEditmode(false);

  useEffect(() => {

    const getDetails = async () => {
      setLoading(true);
        const companyId = sessionStorage.getItem("CompanyId");
        const mobileNumber = sessionStorage.getItem('mobileNumber');

        if (mobileNumber) {
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

      // if (data.length > 0) {
      //   setSelectedCompany(data[0].companyId);
      // }

      console.log('selected company before api call:',selectedCompany);
          const resp = await fetch(
            `http://183.83.219.144:81/LMS/Registration/GetRegistrations/${selectedCompany}`,
            {
              method: 'GET',
              headers: new Headers({
                Authorization: `Bearer ${getToken()}`,
              }),
            },
          );
          const responseData = await resp.json();
          setRegistrations(responseData);

          const respose = await fetch(
            `http://183.83.219.144:81/LMS/Registration/GetRegistrationTypes/${selectedCompany}/${mobileNumber}`,
            {
              method: 'GET',
              headers: new Headers({
                Authorization: `Bearer ${getToken()}`,
              }),
            },
          );
          const respJson = await respose.json();
    setRegistrationTypes(respJson);

          setLoading(false);
        }
      }
    getDetails();
  }, [selectedCompany]);


  function filterUsers(user) {
    if (user.registrationType === "Company" && selected === "Company") {
      return user;
    } else if (
      user.registrationType === "Distributer" &&
      selected === "Distributer"
    ) {
      return user;
    } else if (user.registrationType === "Dealer" && selected === "Dealer") {
      return user;
    } else if (
      user.registrationType === "Mechanic" &&
      selected === "Mechanic"
    ) {
      return user;
    } else if (selected === "" || selected === 'All') {
      return user;
    }
  }

  const filteredUsers =
    !registrations.message && registrations?.filter(filterUsers);

  //edit user
  function handleEdit(user) {
    console.log("user to be edited", user);
    setEditmode(true);
    setEditValues({
      dropdown: user.registrationTypeExtId,
      mobileNumber: user.registerMobileNumber,
      name: user.registerName,
      address1: user.registerAddress1,
      address2: user.registerAddress2,
      city: user.city,
      state: user.state,
      pincode: user.pinCode,
      upiAddress: user.upiAddress,
      aadhaarNumber: user.adhaarNumber,
      panNumber: user.panNumber,
    });
    // console.log("initialValues",initialValues)
    // formik.handleSubmit(user);
    // toggleEdit();
    navigate("/adduser");
  }

  //delete or restore user
  function handleDeleteOrRestore(user) {
    user.isActive = !user.isActive; //toggle user status
    // console.log('user status before:',user.isActive);
    user.isActive
      ? alert(JSON.stringify(user.registerName) + " Account restored")
      : alert(JSON.stringify(user.registerName) + " Account deleted");

    fetch(`http://183.83.219.144:81/LMS/Registration/SaveRegistration`, {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log("response from delete user:", responseData);
      })
      .catch((error) => console.log(error));
    navigate("/userlist");
  }

  const exportExcelFile = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("My Sheet");
    sheet.columns = [
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
        header: "City",
        key: "city",
        width: 20,
      },
      {
        header: "User Type",
        key: "userType",
        width: 15,
      },
    ];
    console.log("registrations before export:", registrations);

    const promise = Promise.all(
      filteredUsers?.map(async (user) => {
        // const rowNumber = index + 1;
        sheet.addRow({
          mobileNumber: user.registerMobileNumber,
          name: user.registerName,
          city: user.city,
          userType: user.registrationType,
        });
        // return(registrations);
      })
    );
    promise.then(() => {
      console.log("promise:", promise);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "userlist.xlsx");
    });
  };
  
  const handleCompanyChange = (event) => {
    const selectedCompanyId = event.target.value;
    setSelectedCompany(selectedCompanyId);
  };

  
  return (
        <div style={{ width: "100%", }}>
          <div style={{alignItems:"center",flexDirection:'column',}}>
            <h4 className="header mb-4 font-weight-bold">User List</h4>
<div className="d-flex align-items-center mb-3">
<label className="mb-0 mr-2 ">Company:</label>
            <select
            className="form-control user_list_drop_down mr-2"
              name="dropdown"
              onChange={handleCompanyChange}
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
          <label className="mb-0 mr-2"  >Type: </label>
            <select
            className="form-control user_list_drop_down"
              name="dropdown"
              onChange={(event) => {
                setSelected(event.target.value);
              }}
            >
              {!registrationtypes.message && (
                <>
                  <option value="All">All</option>
                  {registrationtypes
                  ?.map((type) => (
                    <option
                      key={type.registrationTypeName}
                      value={type.registrationTypeName}
                    >
                      {type.registrationTypeName}
                    </option>
                  ))}
                </>
              )}
            </select>
    
            </div>
            <table className="table table-striped">
              <thead style={{ justifyContent: "center" }}>
                {registrations?.length !== 0 ? (
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
                {!registrations.message &&
                  filteredUsers?.map((user) => (
                    <tr>
                      <td className="user">{user.registerMobileNumber}</td>
                      <td className="user"> {user.registerName}</td>
                      <td className="user">{user.city}</td>
                      <td className="user">{user.registrationType}</td>
                      <td>

                            <button
                              // className={user.isActive? "btn btn-secondary": "btn btn-light" }
                              style={{
                                color: "white",
                                padding: 5,
                                borderRadius: 5,
                                backgroundColor:
                                  user.isActive === true ? "blue" : "grey",
                                border: 0,
                                width: "30%",
                                cursor:
                                  user.isActive === true
                                    ? "pointer"
                                    : "not-allowed",
                              }}

                              disabled={!user.isActive}
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </button>
                            <button
                              type="submit"
                              style={{
                                color: "white",
                                padding: 5,
                                borderRadius: 5,
                                backgroundColor:
                                  user.isActive === true ? "red" : "green",
                                border: 0,
                                width: "55%",
                                marginLeft: 8,
                              }}
                              onClick={() => handleDeleteOrRestore(user)}
                            >
                              {user.isActive ? "Delete" : "Restore"}
                            </button>

                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length !== 0 && (
            <button
              className="btn btn-secondary float-end mt-2 mb-2"
              onClick={exportExcelFile}
            >
              Export to Excel
            </button>
          )}
        </div>
  );
}
