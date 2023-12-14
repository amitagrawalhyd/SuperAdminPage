import { useState, useEffect } from "react";
import "../App.css";
import Loader from "react-js-loader";
import { FunctionsRounded } from "@mui/icons-material";

const NotifyUsers = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const token = sessionStorage.getItem("token");
  const [file, setFile] = useState("");
  var startDate = new Date();
  var endDate = new Date();
  const [img, setImg] = useState("");
  const reader = new FileReader();
  const [registrations, setRegistrations] = useState([]); // users
  let heading = ["Select", "Mobile Number", "Name"];
  const [selectedItems, setSelectedItems] = useState([]); // for checkbox
  const [loading, setLoading] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(2);

  var responseArray = [];

  const handleCheckboxChange = (user) => {
    if (selectedItems.includes(user)) {
      setSelectedItems(selectedItems.filter((item) => item !== user));
    } else {
      setSelectedItems([...selectedItems, user]);
    }
  };



  useEffect(() => {
    getCompanies();
  }, []);

  console.log('selected value:',selectedCompany);
  const getCompanies = async () => {
    setLoading(true);
    try {
      const companyId = sessionStorage.getItem("CompanyId");
      const res = await fetch(
        `http://183.83.219.144:81/LMS/Company/Companies/${companyId}`,
        {
          method: "GET",
          headers: new Headers({
            Authorization: `Bearer ${token}`,
          }),
        }
      );
      const respJson = await res.json();
      setCompanies(respJson);

getUsers();
      setLoading(false);
    } catch (error) {
      console.error("Error from get users api:", error);
    }
  };

  file && reader.readAsDataURL(file);
  reader.onload = () => {
    // console.log('called: ', reader)
    setImg(reader.result);
  };

async function getUsers() {
  const response = await fetch(
    `http://183.83.219.144:81/LMS/Registration/GetRegistrations/${selectedCompany}`,
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    }
  );
  const data = await response.json();
  setRegistrations(data);
}


  // console.log('base64 image:',img.split(",").pop());
  // console.log("title and description from notify users:",title,description)

  const handleNotify = async () => {
    setLoading(true);
    responseArray = await Promise.all(
      selectedItems.map(async (user) => {
        const response = await fetch(
          `http://183.83.219.144:81/LMS/Notification/SaveNotification`,
          {
            method: "POST",
            headers: new Headers({
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({
              companyId: selectedCompany,
              title: title,
              description: description,
              imageURL: img.split(",").pop(),
              startDateTime: startDate.toISOString(),
              endDateTime: endDate.toISOString(),
              isActive: true,
              mobileNumber: user.registerMobileNumber,
            }),
          }
        );
        console.log("response from notify users:", response);
        return await response.json();
      })
    );
    setLoading(false);
    console.log("responseArray:", responseArray);
    // Check if any element in responseArray is false
    const notificationFailed = responseArray.some((response) => !response);
    console.log("notification status:", notificationFailed);

    if (notificationFailed) {
      alert("Failed to send some notifications.");
    } else {
      alert("Notifications sent successfully.");
    }
    setTitle("");
    setDescription("");
    setFile("");
    setImg("");
    setSelectedItems([]);
  };

  console.log('image:',file,img)
  const handleCompanyChange = (event) => {
    const selectedCompanyId = event.target.value;
    setSelectedCompany(selectedCompanyId);
  };


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
        <>
        <h4 className="header mb-4 font-weight-bold">List of Users</h4>
        <div className="d-flex flex-direction-row align-items-center">    
        <label className="mb-0 mr-2 ">Company:</label>
        <select
        className="form-control user_list_drop_down"
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
        <button
              type="button"
              class="btn btn-primary"
              style={{ margin: 10 }}
              onClick={getUsers}
            >
              Submit
            </button>
          </div>

        <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
          {registrations.length !== 0 ? (
            <div style={{ width: "40%" }}>
              <table className="table table-striped">
                <thead style={{ justifyContent: "center" }}>
                  <tr>
                    {heading.map((head, headID) => (
                      <th key={headID}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!registrations.message &&
                    registrations?.map((user) => (
                      <tr>
                        <td>
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={selectedItems.includes(user)}
                            onChange={() => handleCheckboxChange(user)}
                          />
                        </td>
                        <td className="user">{user.registerMobileNumber}</td>
                        <td className="user"> {user.registerName}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ height: "69vh", width:'40%' }}
            >
              <p>No records found</p>
            </div>
          )}
          <div className="notification-container">
            <form className="notification-form">
              <h4 className="font-weight-bold">Send Notifications</h4>


              <input
                className="notification-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <textarea
                value={description}
                className="notification-description"
                placeholder="Description"
                onChange={(e) => setDescription(e.target.value)}
              />
              <img
                style={{
                  width: file ? "25%" : "15%",
                  height: file ? "25%" : "15%",
                  margin: "10px 0px",
                }}
                src={
                  file
                    ? URL.createObjectURL(file)
                    : require("./../assets/Preview2008.webp")
                }
                alt="preview image"
              />

              <label
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 20,
                }}
              >
                {/* <AttachFileIcon /> Upload Image */}
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  // accept="image/*"
                  accept=".png, .jpg, .jpeg, .gif"
                  // style={{ display: "none" }}
                />
              </label>

              <button
                onClick={() => handleNotify()}
                style={{
                  color: "white",
                  padding: 5,
                  borderRadius: 5,
                  backgroundColor: !title || !description ? "grey" : "blue",
                  border: 0,
                  cursor: !title || !description ? "not-allowed" : "pointer",
                  bottom: 15,
                  border: 0,
                  right: 15,
                  position: "absolute",
                }}
                disabled={!title || !description}
                type="button"
              >
                Notify
              </button>
            </form>
          </div>
        </div>
        </>
      )}
    </>
  );
};

export default NotifyUsers;
