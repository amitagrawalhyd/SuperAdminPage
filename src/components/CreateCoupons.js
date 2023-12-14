import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from "react-js-loader";

export default function CreateCoupons() {
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const companyId = sessionStorage.getItem("CompanyId");
    const getCompanies = async () => {
      setLoading(true);
      const token = sessionStorage.getItem("token");
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
      setLoading(false);
    };
    getCompanies();
  }, []);

  const validationSchema = Yup.object().shape({
    company: Yup.number().required("Company is required"),
    numberOfCoupons: Yup.string()
      .required("Number of Coupons is required")
      .matches(/^[0-9]+$/, "Face Value should be a number"),
    faceValue: Yup.string()
      .required("Face Value is required")
      .matches(/^[0-9]+$/, "Face Value should be a number"),
    expiryInMonth: Yup.string()
      .required("Expiry (in months) is required")
      .matches(/^[0-9]+$/, "Expiry (in months) should be a number"),
    mobileNumber: Yup.string()
      .required("Mobile Number is required")
      .matches(/^\d{10}$/, "Invalid mobile number format"),
  });

  const formik = useFormik({
    initialValues: {
      company: 2,
      // company: companies && companies.length > 0 ? companies[0].companyId : "",
      numberOfCoupons: "",
      faceValue: "",
      expiryInMonth: "",
      mobileNumber: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      // Add your logic here to submit the form data
      console.log("Form data submitted:", values);

      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (token) {
        const resp = await fetch(
          `http://183.83.219.144:81/LMS/Coupon/CouponRequest`,
          {
            method: "POST",
            headers: new Headers({
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({
              company: values.company,
              numberOfCoupons: values.numberOfCoupons,
              companyLogoBase64: values.companyLogo,
              faceValue: values.faceValue,
              expiryInMonth: values.expiryInMonth,
              mobileNumber: values.mobileNumber,
            }),
          }
        );
        const respJson = await resp.json();
        console.log("handlesubmit response:", respJson);
        if (respJson) {
          alert("submitted successfully");
          resetForm();
        } else {
          alert("something went wrong, please try again");
        }
        setLoading(false);
      }
    },
  });

  // const handleSubmit = async () => {
  //     // You can now use the selectedCompany state as needed
  //     console.log("edited number: ", formData.companyContactNumber);

  //     // Add your logic here to submit the selected company
  //     setLoading(true);
  //     const token = sessionStorage.getItem("token");
  //     if (token) {
  //       const resp = await fetch(
  //         `http://183.83.219.144:81/LMS/Coupon/CouponRequest`,
  //         {
  //           method: "POST",
  //           headers: new Headers({
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           }),
  //           body: JSON.stringify(formData),
  //         }
  //       );
  //       const respJson = await resp.json();
  //       console.log("handlesubmit response:", respJson);
  //       setLoading(false);
  //     }
  //   };

  return (
    <>
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "85vh",
          }}
        >
          <Loader bgColor={"#16210d"} type="spinner-cub" />
        </div>
      ) : (
        <div>
          <form
            className="mx-auto border border-secondary p-2 rounded"
            style={{ width: "35%" }}
            onSubmit={formik.handleSubmit}
          >
            <h4 className="header mb-2 text-center font-weight-bold">
              Create Coupons
            </h4>
            <div>
              <label className=" mr-2">Company:</label>
              <select
                className="form-control user_list_drop_down"
                name="company"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.company}
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
              {formik.touched.company && formik.errors.company && (
                <div className="text-danger form-error">
                  {formik.errors.company}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="label3">Number of Coupons:</label>
              <input
                type="text"
                name="numberOfCoupons"
                className="form-control mb-2"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.numberOfCoupons}
              />
              {formik.touched.numberOfCoupons &&
                formik.errors.numberOfCoupons && (
                  <div className="text-danger form-error">
                    {formik.errors.numberOfCoupons}
                  </div>
                )}
            </div>
            <div>
              <label htmlFor="label4">Face Value:</label>
              <input
                type="text"
                name="faceValue"
                className="form-control mb-2"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.faceValue}
              />
              {formik.touched.faceValue && formik.errors.faceValue && (
                <div className="text-danger form-error">
                  {formik.errors.faceValue}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="label5">Expiry (in months):</label>
              <input
                type="text"
                name="expiryInMonth"
                className="form-control mb-2"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.expiryInMonth}
              />
              {formik.touched.expiryInMonth && formik.errors.expiryInMonth && (
                <div className="text-danger form-error">
                  {formik.errors.expiryInMonth}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="label6">Mobile Number:</label>
              <input
                type="text"
                name="mobileNumber"
                className="form-control mb-2"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.mobileNumber}
              />
              {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                <div className="text-danger form-error">
                  {formik.errors.mobileNumber}
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
