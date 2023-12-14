import { Constants } from "../constants/credentials";

export const getToken = () => {
    const token =sessionStorage.getItem('token') ;
    return token;
  };

  export function getUsers() {
//   const storedMobileNumber = sessionStorage.getItem("mobileNumber");
const CompanyId = sessionStorage.getItem('CompanyId');
fetch(`http://183.83.219.144:81/LMS/Registration/GetRegistrations/${CompanyId}`, {
      method: 'GET',
      //Request Type
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
    })
      .then(response => response.json())
      .then(responseJson => {
        // console.log(responseJson);
        console.log('user details api response from get users',responseJson)
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
    
  