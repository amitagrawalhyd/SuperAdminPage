import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";

import { useFormik } from "formik";
import { getToken } from "./UserList";
import { useNavigate } from "react-router-dom";
import Loader from "react-js-loader";

const AddUserContext = createContext();

export const AddUserProvider = ({ children }) => {
  const [editmode, setEditmode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    dropdown: 5,
    mobileNumber: "",
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    upiAddress: "",
    aadhaarNumber: "",
    panNumber: "",
  });
  const [editValues, setEditValues] = useState({
    dropdown: 6,
    mobileNumber: "",
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    upiAddress: "",
    aadhaarNumber: "",
    panNumber: "",
  });

  // const toggleEdit = () => {
  //   setEditmode(!editmode);
  // };

  return (
    <AddUserContext.Provider
      value={{
        initialValues,
        setInitialValues,
        editmode,
        setEditmode,
        editValues,
        setEditValues,
      }}
    >
      {children}
    </AddUserContext.Provider>
  );
};

export const useAddUser = () => {
  return useContext(AddUserContext);
};

export default function AddUser() {
  const CompanyId = sessionStorage.getItem("CompanyId");
  const storedMobileNumber = sessionStorage.getItem("mobileNumber");
  const [registrationTypes, setRegistrationTypes] = useState([]); // types of registrations (distributor,dealer,mechanic)
  const [adminDetails, setAdminDetails] = useState([]); // admin details
  // const defaultOption = options[0]; //dropdown menu default option
  const { initialValues, editmode, setEditmode, editValues } = useAddUser();
  const navigate = useNavigate();
  const parentRegistrationId = sessionStorage.getItem("parentRegistrationId");
  var adminRegistrationId = 0;
  const [loading, setLoading] = useState(false);
  const formikRef = useRef();
  const [showcomponent, setShowComponent] = useState(false); //combo box
  const [companies,setCompanies] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(2);

  useEffect(() => {
    getRegistrationTypes();
  }, []);

  const getRegistrationTypes = async () => {
    const companyId = sessionStorage.getItem("CompanyId");
    setLoading(true);
    const res = await fetch(
      `http://183.83.219.144:81/LMS/Company/Companies/${companyId}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: `Bearer ${getToken()}`,
        }),
      },
    );
    const respJson = await res.json();
setCompanies(respJson);

    const resp = await fetch(
      `http://183.83.219.144:81/LMS/Registration/GetRegistrationTypes/${selectedCompany}/${storedMobileNumber}`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${getToken()}`,
        }),
      }
    ).catch((error) => console.log(error));

    const data = await resp.json();
    setRegistrationTypes(data);
    setLoading(false);
  };

  const validate = (values) => {
    const errors = {};

    if (!values.name) {
      errors.name = "Name is required";
    }

    if (!values.mobileNumber) {
      errors.mobileNumber = "Mobile Number is required";
    }
    if (!values.pincode) {
      errors.pincode = "Pincode is required";
    }
    return errors;
  };

  const formik = useFormik({
    initialValues: editmode ? editValues : initialValues,
    enableReinitialize: true,
    validate,
    onSubmit: (values, { resetForm }) => {
      console.log(JSON.stringify(values));
      console.log("values before submitting:", values);
      console.log(
        "admin id onsubmit:",
        adminRegistrationId,
        "user type:",
        values.dropdown
      );
      setEditmode(false);
      setLoading(true);
      fetch(`http://183.83.219.144:81/LMS/Registration/SaveRegistration`, {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${getToken()}`,
          // 'Accept': 'application/json, text/plain, */*',
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          registrationId: 0,
          companyId: CompanyId, //required
          registrationTypeId: 0,
          registrationTypeExtId: values.dropdown, //required
          registrationType: "",
          registerMobileNumber: values.mobileNumber, //required
          registerImeiNumber: "",
          pin: "",
          registerName: values.name, //`${values.name}`//required
          registerAddress1: values.address1, //required
          registerAddress2: values.address2, //required
          city: values.city, //required
          state: values.state, //required
          pinCode: values.pincode, //required
          parentRegistrationId: parentRegistrationId, //required
          walletValue: 0,
          expiredWalletValue: 0,
          paidValue: 0,
          upiAddress: values.upiAddress, //input field
          adhaarNumber: values.aadhaarNumber, //input field
          panNumber: values.panNumber, //input field
          isActive: true, //required
        }),
      })
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData) {
            alert("submitted successfully");
            // window.location.reload();
            // navigate("/userlist");
            resetForm();
          } else {
            alert("failed to add user");
          }
          console.log("response from saveRegistration:", responseData);
          setLoading(false)
        })
        .catch((error) => console.log(error));
    },
    // onReset: (values,{ resetForm }) => resetForm(),
  });

  const handleComboSubmit = async () => {
    console.log("Selected Company: ", selectedCompany);
    setShowComponent(true);
  };

  return (

        <div className="user-form-container">
          <div className="user-form">
            <form onSubmit={formik.handleSubmit} innerRef={formikRef}>
              {/* <Dropdown
          className="user_dropdown"
          options={registrationTypes}
          // onChange={handleSelectType}
          value="-----"
          // placeholder="Select an option"
        /> */}
                <h4 className="font-weight-bold text-center">Add User</h4>

              <div
                style={{ display: "flex", flexDirection: "row", margin: 10 }}
              >
                <div style={{ flexDirection: "column", margin: 10 }}>
                  <label>Select type of user:</label>
                  {/* {editmode ? ( */}
                  {/* <input value={formik.values.dropdown} disabled /> */}
                  {/* ) : ( */}
                  <select
                    value={formik.values.dropdown}
                    name="dropdown"
                    onChange={formik.handleChange}
                    disabled={editmode}
                  >
                    {!registrationTypes.message &&
                      registrationTypes?.map((type) => {
                        return (
                          <option
                            key={type.registrationTypeExtId}
                            value={type.registrationTypeExtId}
                          >
                            {type.registrationTypeName}
                          </option>
                        );
                      })}
                  </select>
                  {/* )} */}
                  <br />
                  <label> Mobile Number: </label>
                  {/* <br /> */}
                  <input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="mobileNumber"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={editmode}
                    value={formik.values.mobileNumber}
                  />
                  {formik.touched.mobileNumber && formik.errors.mobileNumber ? (
                    <div className="text-danger form-error">{formik.errors.mobileNumber}</div>
                  ) : null}
                  <br />
                  <label>Name: </label>
                  <input
                    id="name"
                    name="name"
                    type="name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                    autoComplete="off"
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <div className="form-error text-danger">{formik.errors.name}</div>
                  ) : null}
                  <br />
                  <label>Address1: </label>
                  <input
                    id="address1"
                    name="address1"
                    type="address1"
                    onChange={formik.handleChange}
                    value={formik.values.address1}
                  />
                  {formik.touched.address1 && formik.errors.address1 ? (
                    <p style={{ color: "red" }}>{formik.errors.address1}</p>
                  ) : null}
                  <br />
                  <label>Address2: </label>
                  <input
                    id="address2"
                    name="address2"
                    type="address2"
                    onChange={formik.handleChange}
                    value={formik.values.address2}
                  />
                  <br />
                  <label>City: </label>
                  <input
                    id="city"
                    name="city"
                    type="city"
                    onChange={formik.handleChange}
                    value={formik.values.city}
                  />
                  <br />
                </div>
                <div style={{ flexDirection: "column", margin: 10 }}>
                <label className="mb-0 mr-2 ">Company:</label>
            <select
            className=""
              name="dropdown"
              onChange={(event) => {
                setSelectedCompany(event.target.value);
                console.log('dropdown changed to ',event.target.value);
              }}
            >
              {!companies.message && (
                <>
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
                  <label>State: </label>
                  <input
                    id="state"
                    name="state"
                    type="state"
                    onChange={formik.handleChange}
                    value={formik.values.state}
                  />
                  <br />
                  <label>Pincode: </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="pincode"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.pincode}
                  />
                  {formik.touched.pincode && formik.errors.pincode ? (
                    <div className="form-error text-danger">{formik.errors.pincode}</div>
                  ) : null}
                  <br />
                  <label>UPI Address: </label>
                  <input
                    id="upiAddress"
                    name="upiAddress"
                    type="upiAddress"
                    onChange={formik.handleChange}
                    value={formik.values.upiAddress}
                  />

                  <br />
                  <label>Aadhaar Number: </label>

                  <input
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    type="aadhaarNumber"
                    onChange={formik.handleChange}
                    value={formik.values.aadhaarNumber}
                  />
                  {formik.touched.aadhaarNumber &&
                  formik.errors.aadhaarNumber ? (
                    <p style={{ color: "red" }}>
                      {formik.errors.aadhaarNumber}
                    </p>
                  ) : null}
                  <br />
                  <label>Pan Number:</label>

                  <input
                    id="panNumber"
                    name="panNumber"
                    type="panNumber"
                    onChange={formik.handleChange}
                    value={formik.values.panNumber}
                  />
                  <br />
                  <button
                    className="btn btn-warning"
                    style={{
                      // alignSelf: "flex-end",
                      position: "absolute",
                      bottom: 0,
                      // right: 40,
                      marginBottom: 10,
                      border: 0,
                    }}
                    type="reset"
                    // onClick={() => window.location.reload()}
                    onClick={() => {
                      formik.resetForm();
                      setEditmode(false);
                      console.log("reset clicked");
                    }}
                  >
                    Reset
                  </button>

                  <button
                    className="btn btn-primary"
                    style={{
                      alignSelf: "flex-end",
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      marginBottom: 10,
                      marginRight:10,
                      border: 0,
                    }}
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
  );
}
