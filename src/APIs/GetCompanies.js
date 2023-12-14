

  export function getCompanies() {
//   const storedMobileNumber = sessionStorage.getItem("mobileNumber");
const companyId = sessionStorage.getItem('CompanyId');
const token = sessionStorage.getItem('token')
fetch( `http://183.83.219.144:81/LMS/Company/Companies/${companyId}`,
{
      method: 'GET',
      //Request Type
        headers: {
          Authorization: `Bearer ${token}`
        },
    })
      .then(response => response.json())
      .then(responseJson => {
        // console.log(responseJson);
        console.log('companies api response from get companies:',responseJson)
       if(!responseJson.message) {
        return responseJson
    } else console.log('failed')
      })
      //If response is not in json then in error
      .catch(error => {
        console.log('user details error:',error);
        // return error;
      });
    }
    
  