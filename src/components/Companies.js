import { useEffect, useState } from "react";
import Loader from "react-js-loader";
import Combo from "./Combo";
import { responsivePropType } from "react-bootstrap/esm/createUtilityClasses";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const Companies = () => {
  const [loading, setLoading] = useState(false);
  const [showcomponent, setShowComponent] = useState(false); //combo box
  const [selectedCompany, setSelectedCompany] = useState(""); // combo box
  const [companies, setCompanies] = useState([]);
  let heading = ["Company Id", "Company Name", "Actions"];
  const [file, setFile] = useState(""); // choose file from file manager
  const [img, setImg] = useState(""); // image file
  const reader = new FileReader();
  const companyId = sessionStorage.getItem("CompanyId");
  const navigate = useNavigate();

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result.split(",")[1]);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  const validationSchema = Yup.object().shape({
    companyName: Yup.string().required("Company Name is required"),
    companyCode: Yup.string().required("Company Code is required").matches(/^[A-Z]{2}$/, 'Invalid format'),
    companyContactNumber: Yup.string().matches(
      /^\d{10}$/,
      "Invalid mobile number format"
    ),
    // .required("Company Contact Number is required"),
    companyContactEmail: Yup.string().email("Invalid email format"),
    // .required("Company Contact Email is required"),
    customerCareContactNumber: Yup.string().matches(
      /^\d{10}$/,
      "Invalid mobile number format"
    ),
    // .required("Customer Care Number is required"),
    customerCareContactEmail: Yup.string().email("Invalid email format"),
    // .required("Customer Care Email is required"),
    transactionLimit: Yup.number()
    // .required("Transaction Limit is required")
    .integer("Transaction Limit must be an integer").min(0, "Transaction Limit must be at least 0"),
  });

  const formik = useFormik({
    initialValues: {
      companyName: "",
      companyLogo: "",
      companyCode: "",
      companyContactNumber: "",
      companyContactEmail: "",
      customerCareContactNumber: "",
      customerCareContactEmail: "",
      transactionLimit: 0,
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      // Add your logic here to submit the form data
      console.log("Form data submitted:", values);

      if (file) {
        console.log("Selected File:", file);
        const base64Logo = await convertFileToBase64(file);
        values.companyLogo = base64Logo;
      }

      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (token) {
        const resp = await fetch(
          `http://183.83.219.144:81/LMS/Company/SaveCompany`,
          {
            method: "POST",
            headers: new Headers({
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({
              companyName: values.companyName,
              companyCode: values.companyCode,
              companyLogoBase64: values.companyLogo,
              companyContactNumber: values.companyContactNumber,
              companyContactEmail: values.companyContactEmail,
              customerCareContactNumber: values.customerCareContactNumber,
              customerCareContactEmail: values.customerCareContactEmail,
              transactionLimitPerRequest:(values.transactionLimit === 0 || values.transactionLimit === "") ? 100 : values.transactionLimit,
              isActive: true,
              "companyGST": "",
              "companyPAN": "",
              // "companyAddress": "",
            }),
          }
        );
        const respJson = await resp.json();
        console.log("handlesubmit response:", respJson);
        if(respJson){
          alert('submitted successfully');
          resetForm();
        }
        else{
          alert('something went wrong, please try again')
        }
        setLoading(false);
      }
      handleComboSubmit();
    },
  });

  // const handleInputChange = (label, value) => {
  //   let newErrors = { ...formErrors };

  //   // Basic email validation
  //   if (label === "companyContactEmail" || label === "customerCareContactEmail") {
  //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //     newErrors[label] = emailRegex.test(value) ? "" : "Invalid email format";
  //   }

  //   // Basic mobile number validation
  //   if (
  //     label === "companyContactNumber" ||
  //     label === "customerCareContactNumber"
  //   ) {
  //     const mobileRegex = /^\d{10}$/; // Assuming a 10-digit mobile number
  //     newErrors[label] = mobileRegex.test(value)
  //       ? ""
  //       : "Invalid mobile number format";
  //   }

  //   setFormErrors(newErrors);

  //   // Update the state if validation passes
  //   setFormData({
  //     ...formData,
  //     [label]: value,
  //   });
  // };

  const [editingCompany, setEditingCompany] = useState(null); // New state to track the selected company for editing

  // Function to handle the "edit" button click
  // const handleEditClick = (company) => {
  //   setEditingCompany(company);

  //   // Populate the form fields with the selected company's data
  //   setFormData({
  //     companyId: company.companyId,
  //     companyName: company.companyName,
  //     companyLogo: company.companyLogo,
  //     companyContactNumber: company.companyContactNumber,
  //     companyContactEmail: company.companyContactEmail,
  //     customerCareContactNumber: company.customerCareContactNumber,
  //     customerCareContactEmail: company.customerCareContactEmail,
  //   });
  // };

  // Function to handle the "edit" button click
const handleEditClick = (company) => {
  setEditingCompany(company);

  // Populate the form fields with the selected company's data
  formik.setValues({
    companyName: company.companyName,
    companyLogo: company.companyLogo,
    companyCode: company.companyCode,
    companyContactNumber: company.companyContactNumber,
    companyContactEmail: company.companyContactEmail,
    customerCareContactNumber: company.customerCareContactNumber,
    customerCareContactEmail: company.customerCareContactEmail,
    transactionLimit: company.transactionLimitPerRequest, 
  });
};


  const handleComboSubmit = async () => {
    // You can now use the selectedCompany state as needed
    console.log("Selected Company: ", selectedCompany);
    
    // Add your logic here to submit the selected company
    setLoading(true);
    const token = sessionStorage.getItem("token");
    console.log('token',token)
    if (token) {
      const resp = await fetch(
        `http://183.83.219.144:81/LMS/Company/Companies/${companyId}`,
        {
          method: "GET",
          headers: new Headers({
            Authorization: `Bearer ${token}`,
          }),
        }
      );
      const respJson = await resp.json();
      setCompanies(respJson);
      setLoading(false);
    }

    setShowComponent(true);
  };

  useEffect(() => {
    handleComboSubmit();
  }, []);

  function handleDeleteOrRestore(company) {
    const token = sessionStorage.getItem("token");

    company.isActive = !company.isActive; //toggle company status
    company.companyLogoBase64 = company.companyLogo;
    console.log('company status before:',company);
    company.isActive
      ? alert(JSON.stringify(company.companyName) + " Company restored")
      : alert(JSON.stringify(company.companyName) + " Company deleted");

    fetch(`http://183.83.219.144:81/LMS/Company/SaveCompany`, {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(company),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log("response from delete company:", responseData);
      })
      .catch((error) => console.log(error));
    navigate("/companies");
  }

  file && reader.readAsDataURL(file);
  reader.onload = () => {
    setImg(reader.result);
  };

  return (
    <>
      {loading ? (
        <div style={{display:"flex",alignItems:'center',justifyContent:'center',height:'85vh'}}>
        <Loader bgColor={"#16210d"} type="spinner-cub"/>
        </div>
      ) : (
        <>
      <h4 className=" font-weight-bold mb-4 ml-3">List of Companies</h4>
      <div className="d-flex flex-direction-row">
        <div className="col-lg-6 pr-3">
          <table
            className="table  table-striped w-100 border-right "
            style={{
              borderRight: "1px solid #ddd !important",
              paddingRight: "15px !important",
            }}
          >
            <thead style={{ padding: 20, backgroundcolor: "red" }}>
              <tr>
                {heading.map((head, headID) => (
                  <th key={headID}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!companies.message &&
                companies?.map((company) => (
                  <tr>
                    <td className="company">{company.companyId}</td>
                    <td className="company">{company.companyName}</td>
                    <td>
                      <button
                        onClick={() => handleEditClick(company)}
                        // style={{
                        //   color: "white",
                        //   padding: 5,
                        //   borderRadius: 5,
                        //   backgroundColor: "blue",
                        //   border: 0,
                        //   cursor: "pointer",
                        // }}
                        className="btn btn-primary"
                        type="button"
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
                                  company.isActive === true ? "red" : "green",
                                border: 0,
                                width: "55%",
                                marginLeft: 8,
                              }}
                              onClick={() => handleDeleteOrRestore(company)}
                            >
                              {company.isActive ? "Delete" : "Restore"}
                            </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="col-lg-6 pr-3 d-">
          <form
            className="mx-auto border border-secondary p-2 rounded w-100"
            onSubmit={formik.handleSubmit}
          >
            <h6 className="font-weight-bold text-center mb-1">
              Add/Edit Company
            </h6>
            <div className="d-flex flex-direction-row">
              <div className="flex-direction-column w-50 mr-2">
                <div>
                  <label htmlFor="companyName">Company Name:</label>
                  <input
                    type="text"
                    className={`form-control mb-2 ${
                      formik.touched.companyName && formik.errors.companyName
                        ? "is-invalid"
                        : ""
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.companyName}
                    // disabled={formik.values.companyName}
                    name="companyName"
                    // style={{
                    //   cursor: formik.values.companyName
                    //     ? "not-allowed"
                    //     : "default",
                    // }}
                  />
                  {formik.touched.companyName && formik.errors.companyName && (
                    <div className="text-danger form-error">
                      {formik.errors.companyName}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="companyCode">Company Code:</label>
                  <input
                    type="text"
                    className={`form-control mb-2 ${
                      formik.touched.companyCode && formik.errors.companyCode
                        ? "is-invalid"
                        : ""
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.companyCode}
                    // disabled={formik.values.companyCode}
                    name="companyCode"
                    // style={{
                    //   cursor: formik.values.companyCode
                    //     ? "not-allowed"
                    //     : "default",
                    // }}
                  />
                  {formik.touched.companyCode && formik.errors.companyCode && (
                    <div className="text-danger form-error">
                      {formik.errors.companyCode}
                    </div>
                  )}
                </div>

                <div className="col-lg p-0 border ">
                  <label htmlFor="label2">Company Logo: </label>

                  {/* <input
                type="text"
                value={formData.companyLogo}
                className="form-control mb-2"
                onChange={(e) =>
                  handleInputChange("companyLogo", e.target.value)
                }
              /> */}
                  {/* <img
              className="logo"
              src={`data:image/jpg;base64,${companylogo}`}
            /> */}
                  <img
                    // style={{ width: "50%", }}
                    src={
                      file
                        ? URL.createObjectURL(file)
                        : `data:image/jpg;base64,${formik.values.companyLogo}`
                    }
                    // alt="preview"
                    className="rounded w-75 mb-2"
                  />
                  <input
                    type="file"
                    id="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept="image/*"
                    // style={{ display: "none" }}
                  />
                </div>

                <div>
                  <label htmlFor="companyContactNumber">
                    Company Contact Number:
                  </label>
                  <input
                    type="text"
                    name="companyContactNumber"
                    className={`form-control mb-2 ${
                      formik.touched.companyContactNumber &&
                      formik.errors.companyContactNumber
                        ? "is-invalid"
                        : ""
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.companyContactNumber}
                  />
                  {formik.touched.companyContactNumber &&
                    formik.errors.companyContactNumber && (
                      <div className="text-danger form-error">
                        {formik.errors.companyContactNumber}
                      </div>
                    )}
                </div>
              </div>

              <div className="flex-direction-column w-50">
                <div>
                  <label>Company Contact Email:</label>
                  <input
                    type="text"
                    name="companyContactEmail"
                    className={`form-control mb-2 ${
                      formik.touched.companyContactEmail &&
                      formik.errors.companyContactEmail
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formik.values.companyContactEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.companyContactEmail &&
                    formik.errors.companyContactEmail && (
                      <div className="text-danger form-error">
                        {formik.errors.companyContactEmail}
                      </div>
                    )}
                </div>
                <div>
                  <label htmlFor="label5">Cutomer Care Number:</label>
                  <input
                    type="text"
                    name="customerCareContactNumber"
                    className={`form-control mb-2 ${
                      formik.touched.customerCareContactNumber &&
                      formik.errors.customerCareContactNumber
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formik.values.customerCareContactNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.customerCareContactNumber &&
                    formik.errors.customerCareContactNumber && (
                      <div className="text-danger form-error">
                        {formik.errors.customerCareContactNumber}
                      </div>
                    )}
                </div>
                <div>
                  <label htmlFor="label6">Cutomer Care Email:</label>
                  <input
                    type="text"
                    name="customerCareContactEmail"
                    value={formik.values.customerCareContactEmail}
                    className={`form-control mb-2 ${
                      formik.touched.customerCareContactEmail &&
                      formik.errors.customerCareContactEmail
                        ? "is-invalid "
                        : ""
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.customerCareContactEmail &&
                    formik.errors.customerCareContactEmail && (
                      <div className="text-danger form-error">
                        {formik.errors.customerCareContactEmail}
                      </div>
                    )}
                </div>

                <div>
                  <label htmlFor="transactionLimit">Transaction Limit:</label>
                  <input
                    type="number"
                    name="transactionLimit"
                    className={`form-control mb-2 ${
                      formik.touched.transactionLimit &&
                      formik.errors.transactionLimit
                        ? "is-invalid"
                        : ""
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.transactionLimit}
                  />
                  {formik.touched.transactionLimit &&
                    formik.errors.transactionLimit && (
                      <div className="text-danger form-error">
                        {formik.errors.transactionLimit}
                      </div>
                    )}
                </div>

                <div className="d-flex">
                  <button
                    className="btn btn-primary mt-1 ml-auto"
                    // onClick={() => handleSubmit()}
                    // disabled={!formik.dirty || Object.keys(formik.errors).length > 0}
                    // style={{
                    //   backgroundColor:
                    //     (!formik.dirty ||
                    //       Object.keys(formik.errors).length > 0) === true
                    //       ? "grey"
                    //       : "blue",
                    // }}
                    type="submit"
                  >
                    SUBMIT
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      </>
      )}
      </>
  );
};

export default Companies;
