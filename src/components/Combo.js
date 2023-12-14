import React, { useEffect, useState } from "react";
import ComboBox from 'react-responsive-combo-box';
import 'react-responsive-combo-box/dist/index.css';
import Loader from "react-js-loader";
import { useLocation } from "react-router-dom";

export default function Combo({ handleComboSubmit, setSelectedCompany }) {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const CompanyId = sessionStorage.getItem("CompanyId");
    // const [companies, setCompanies] = useState([]);
    const [selectedCompanyState, setSelectedCompanyState] = useState(null);
    const companiesData = location.pathname !== "/" ? sessionStorage.getItem('companies') : '[]';
    const companies = JSON.parse(companiesData);

    console.log('companies from combo:',companies);

    const handleSelect = (selectedValue) => {
        console.log("Selected Company changed: ", selectedValue);

        const selectedCompany = companies?.find(company => company.companyName === selectedValue);
        setSelectedCompanyState(selectedCompany);
        setSelectedCompany(selectedCompany?.companyId);
    };

    const handleChange = (inputValue) => {
        const isInputValid = companies.some(company => company.companyName === inputValue);

        setSelectedCompanyState(isInputValid ? { companyName: inputValue } : null);
        // console.log('selected company state:',companyName)

        const selectedCompany = companies?.find(company => company.companyName === inputValue);
        setSelectedCompanyState(selectedCompany);
        setSelectedCompany(selectedCompany?.companyId);
    };

    const isSubmitDisabled = !selectedCompanyState;

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
                <div className="d-flex justify-content-center align-items-center h-100">
                <div className="border border-secondary rounded p-3">
                    <h6>Select a company:</h6>
                    <ComboBox
                        options={companies?.map((company) => (company.companyName))}
                        className='comboBox my-3'
                        focusColor='teal'
                        enableAutocomplete
                        // editable={isSubmitDisabled}
                        onSelect={handleSelect}  
                        onChange={(event) => handleChange(event.target.value)}
                    />
                    <div className="d-flex">
                    <button
                        style={{
                            color: "white",
                            padding: 5,
                            borderRadius: 5,
                            backgroundColor: (isSubmitDisabled) ? "grey" : "blue",
                            border: 0,
                            cursor: (isSubmitDisabled) ? "not-allowed" : "pointer",
                            alignSelf:"flex-end",
                            marginLeft:'auto'
                          }}
                        onClick={handleComboSubmit}
                        disabled={isSubmitDisabled}
                    >
                        SUBMIT
                    </button>
                    </div>
                </div>
                </div>
            )}
        </>
    );
}
