import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getToken } from "./User/UserList";
import Loader from "react-js-loader";

export default function CompanyApis() {
  // const companiesData = sessionStorage.getItem("companies");
  // const companies = JSON.parse(companiesData);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companyapis, setCompanyApis] = useState([]);

  const getCompanies = async () => {
    setLoading(true);
    const companyId = sessionStorage.getItem("CompanyId");
    const res = await fetch(
      `http://183.83.219.144:81/LMS/Company/Companies/${companyId}`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${getToken()}`,
        }),
      }
    );
    const data = await res.json();
    setCompanies(data);

    const response = await fetch(
      `http://183.83.219.144:81/LMS/Company/CompaniesAPIDetails`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${getToken()}`,
        }),
      }
    );
    const respJson = await response.json();
    setCompanyApis(respJson);
    setLoading(false);
  };

  useEffect(() => { 
    getCompanies();
  }, []);
  console.log("APIs:", companyapis);

  const validationSchema = Yup.object().shape({
    companyId: Yup.number().required("Company is required"),
    payoutAPIKey: Yup.string().required("Payout API Key is required"),
    payoutSecretKey: Yup.string().required("Payout Secret Key is required"),
    googleAPIKey: Yup.string().required("Google API Key is required"),
    googleAPISecret: Yup.string().required("Google API Secret Key is required"),
    appleAPIKey: Yup.string().required("Apple API Key is required"),
    appleAPISecret: Yup.string().required("Apple API Secret Key is required"),
    androidFCMFileFullPath: Yup.string().required(
      "Android FCM File Path is required"
    ),
  });

  const formik = useFormik({
    initialValues: {
      companyId: "",
      // companyId: companies && companies.length > 0 ? companies[0].companyId : "",
      payoutAPIKey: "",
      payoutSecretKey: "",
      googleAPIKey: "",
      googleAPISecret: "",
      appleAPIKey: "",
      appleAPISecret: "",
      androidFCMFileFullPath: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      // Add your logic here to submit the form data
      console.log("Form data submitted:", values);

      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (token) {
        const resp = await fetch(
          `http://183.83.219.144:81/LMS/Company/SaveCompanyAPIDetails`,
          {
            method: "POST",
            headers: new Headers({
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({
              companyId: values.companyId,
              payoutAPIKey: values.payoutAPIKey,
              payoutSecretKey: values.payoutSecretKey,
              googleAPIKey: values.googleAPIKey,
              googleAPISecret: values.googleAPISecret,
              appleAPIKey: values.appleAPIKey,
              appleAPISecret: values.appleAPISecret,
              androidFCMFileFullPath: values.androidFCMFileFullPath,
            }),
          }
        );
        const respJson = await resp.json();
        console.log("handlesubmit response:", respJson);
        if (respJson) {
          getCompanies();
          alert("submitted successfully");
          resetForm();
        } else {
          alert("something went wrong, please try again");
        }
        setLoading(false);
      }
    },
  });

  function handleCompanyChange(event) {
    formik.handleChange(event);
    console.log(event.target.value);
    const companydetails = companyapis.find(
      (company) => company.companyId === parseInt(event.target.value)
    );
    console.log("selected company:", companydetails);

    formik.setValues({
      ...formik.values,
      companyId: companydetails.companyId,
      payoutAPIKey: companydetails.payoutAPIKey,
      payoutSecretKey: companydetails.payoutSecretKey,
      googleAPIKey: companydetails.googleAPIKey,
      googleAPISecret: companydetails.googleAPISecret,
      appleAPIKey: companydetails.appleAPIKey,
      appleAPISecret: companydetails.appleAPISecret,
      androidFCMFileFullPath: companydetails.androidFCMFileFullPath,
    });
  }

  return (
    <>
    {loading ? (
      <div style={{display:"flex",alignItems:'center',justifyContent:'center',height:'85vh'}}>
      <Loader bgColor={"#16210d"} type="spinner-cub"/>
      </div>
    ) : (
    <div>
      <form
        className="mx-auto border border-secondary p-2 rounded"
        style={{ width: "35%" }}
        onSubmit={formik.handleSubmit}
      >
        <h4 className="header mb-2 text-center font-weight-bold">
          Company APIs
        </h4>
        <div>
          <label className=" mr-2">Company:</label>
          <select
            className="form-control user_list_drop_down"
            name="companyId"
            onChange={handleCompanyChange}
            onBlur={formik.handleBlur}
            value={formik.values.companyId}
          >
            {!companies.message && (
              <>
                <option value="">----</option>
                {companies
                ?.filter((company) => company.isActive === true)
                ?.map((company) => (
                  <option key={company.companyName} value={company.companyId}>
                    {company.companyName}
                  </option>
                ))}
              </>
            )}
          </select>
          {formik.touched.companyId && formik.errors.companyId && (
            <div className="text-danger form-error">
              {formik.errors.companyId}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="label3">Payout API Key:</label>
          <input
            type="text"
            name="payoutAPIKey"
            className={`form-control mb-2 ${
              formik.touched.payoutAPIKey && formik.errors.payoutAPIKey
                ? "is-invalid"
                : ""
            }`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.payoutAPIKey}
          />
          {formik.touched.payoutAPIKey && formik.errors.payoutAPIKey && (
            <div className="text-danger form-error">
              {formik.errors.payoutAPIKey}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="label4">Payout Secret Key:</label>
          <input
            type="text"
            name="payoutSecretKey"
            className={`form-control mb-2 ${
              formik.touched.payoutSecretKey && formik.errors.payoutSecretKey
                ? "is-invalid"
                : ""
            }`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.payoutSecretKey}
          />
          {formik.touched.payoutSecretKey && formik.errors.payoutSecretKey && (
            <div className="text-danger form-error">
              {formik.errors.payoutSecretKey}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="label5">Google API Key:</label>
          <input
            type="text"
            name="googleAPIKey"
            className={`form-control mb-2 ${
              formik.touched.googleAPIKey && formik.errors.googleAPIKey
                ? "is-invalid"
                : ""
            }`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.googleAPIKey}
          />
          {formik.touched.googleAPIKey && formik.errors.googleAPIKey && (
            <div className="text-danger form-error">
              {formik.errors.googleAPIKey}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="label6">Google API Secret Key:</label>
          <input
            type="text"
            name="googleAPISecret"
            className={`form-control mb-2 ${
              formik.touched.googleAPISecret && formik.errors.googleAPISecret
                ? "is-invalid"
                : ""
            }`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.googleAPISecret}
          />
          {formik.touched.googleAPISecret && formik.errors.googleAPISecret && (
            <div className="text-danger form-error">
              {formik.errors.googleAPISecret}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="label6">Apple API Key:</label>
          <input
            type="text"
            name="appleAPIKey"
            className={`form-control mb-2 ${
              formik.touched.appleAPIKey && formik.errors.appleAPIKey
                ? "is-invalid"
                : ""
            }`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.appleAPIKey}
          />
          {formik.touched.appleAPIKey && formik.errors.appleAPIKey && (
            <div className="text-danger form-error">
              {formik.errors.appleAPIKey}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="label6">Apple API Secret Key:</label>
          <input
            type="text"
            name="appleAPISecret"
            className={`form-control mb-2 ${
              formik.touched.appleAPISecret && formik.errors.appleAPISecret
                ? "is-invalid"
                : ""
            }`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.appleAPISecret}
          />
          {formik.touched.appleAPISecret && formik.errors.appleAPISecret && (
            <div className="text-danger form-error">
              {formik.errors.appleAPISecret}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="label6">Android FCM File Path:</label>
          <input
            type="text"
            name="androidFCMFileFullPath"
            className={`form-control mb-2 ${
              formik.touched.androidFCMFileFullPath &&
              formik.errors.androidFCMFileFullPath
                ? "is-invalid"
                : ""
            }`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.androidFCMFileFullPath}
          />
          {formik.touched.androidFCMFileFullPath &&
            formik.errors.androidFCMFileFullPath && (
              <div className="text-danger form-error">
                {formik.errors.androidFCMFileFullPath}
              </div>
            )}
        </div>
        <div className="d-flex">
          <button
            className="btn btn-primary mt-1 ml-auto"
            disabled={formik.isSubmitting}
            type="submit"
          >
            SUBMIT
          </button>
        </div>
      </form>
    </div>
          )}
          </>
  );
}
