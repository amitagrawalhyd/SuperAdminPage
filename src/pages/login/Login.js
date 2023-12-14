import "./Login.css";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../App";

const validationSchema = Yup.object().shape({
  mobileNumber: Yup.string().required("Mobile Number is required").matches(
    /^\d{10}$/,
    "Invalid mobile number format"
  ),
  pin: Yup.string().required("Pin is required").min(6, "Pin must be at least 6 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useAppContext();

  const formik = useFormik({
    initialValues: {
      mobileNumber: "",
      pin: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(
          `http://183.83.219.144:81/LMS/Otp/SuperAdminVallidate/${values.mobileNumber}/${values.pin}`,
          {
            method: "POST",
          }
        );
        const responseData = await response.json();

        if (responseData.validationResult) {
          setToken(responseData.token);
          sessionStorage.setItem("token", responseData.token);
          sessionStorage.setItem("mobileNumber", values.mobileNumber);
          sessionStorage.setItem(
            "CompanyId",
            JSON.parse(atob(responseData.token)).CompanyId
          );
          sessionStorage.setItem(
            "parentRegistrationId",
            JSON.parse(atob(responseData.token)).RegistrationId
          );

          const companies = await getCompanies(
            JSON.parse(atob(responseData.token)).CompanyId,
            responseData.token
          );
          console.log("companies before storing:", companies);
          sessionStorage.setItem("companies", JSON.stringify(companies));

          navigate("/dashboard", {
            state: {
              mobileNumber: values.mobileNumber,
              token: responseData.token,
            },
          });
        } else {
          alert("Invalid credentials :(");
        }
      } catch (error) {
        console.error("Error submitting the form:", error);
      }
    },
  });

  const getCompanies = async (companyId, token) => {
    // Your existing getCompanies function
  };

  return (
    <div className="w-100">
      <div className="split-one">
        <div className="left-heading">
          Coupon App <br />
          <div className="left heading">Super Admin</div>
        </div>
      </div>

      <div className="split-two">
        <form
          method="post"
          onSubmit={formik.handleSubmit}  
          className="w-75 m-auto p-5 login_form"
        >
          <h4 className="mb-3 font-weight-bold text-center">Login</h4>
          <div className="form-group">
            <label>Mobile Number: </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Mobile Number"
              name="mobileNumber"
              value={formik.values.mobileNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="off"
            />
            {formik.touched.mobileNumber && formik.errors.mobileNumber && (
              <div className="form-error text-danger">{formik.errors.mobileNumber}</div>
            )}
          </div>
          <div className="form-group">
            <label>Pin: </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter pin"
              name="pin"
              value={formik.values.pin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="off"
            />
            {formik.touched.pin && formik.errors.pin && (
              <div className="form-error text-danger">{formik.errors.pin}</div>
            )}
          </div>

          <button
            type="submit"
            style={{
              backgroundColor:
                formik.errors.pin || formik.errors.mobileNumber
                  ? "grey"
                  : "#16219d",
            }}
            disabled={formik.errors.pin || formik.errors.mobileNumber}
            className="btn btn-primary align-self-flex-end"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
