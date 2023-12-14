import { useState, useEffect } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import Cookies from "js-cookie";
import "../App.css";
import { getToken } from "./User/UserList";
import { useNavigate } from "react-router-dom";
import { useAddUser } from "./User/AddUser";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import Loader from "react-js-loader";

const Notifications = () => {
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const token = sessionStorage.getItem("token");
  const mobileNumber = sessionStorage.getItem("mobileNumber");
  const [file, setFile] = useState("");
  var startDate = new Date();
  var endDate = new Date();
  const [img, setImg] = useState("");
  const reader = new FileReader();
  const CompanyId = sessionStorage.getItem("CompanyId");
  const [registrationtypes, setRegistrationTypes] = useState([]);
  let heading = ["Select", "Mobile Number", "Name"];
  const [selectedItems, setSelectedItems] = useState([]);
  const [selected, setSelected] = useState(""); // Define 'selected' here
  const [loading, setLoading] = useState(false);
  const [showcomponent, setShowComponent] = useState(false); //combo box
  const [companies, setCompanies] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(2);

  const navigate = useNavigate();
  const { setEditmode } = useAddUser();
  setEditmode(false);

  useEffect(() => {
    getRegistrationTypes();
  }, []);

  async function getRegistrationTypes() {
    const companyId = sessionStorage.getItem("CompanyId");
    setLoading(true);
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

    const resp = await fetch(
      `http://183.83.219.144:81/LMS/Registration/GetRegistrationTypes/${selectedCompany}/${mobileNumber}`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      }
    ).catch((error) => {
      console.log("error fetching registration types:", error);
    });
    const data = await resp.json();
    console.log("registration types:", data);
    setRegistrationTypes(data);
    setLoading(false);
  }

  console.log("selected dropdown value:", selected);

  function handleNotify() {
    setLoading(true);
    let requestBody = {
      companyId: selectedCompany,
      title: title,
      description: description,
      imageURL: img.split(",").pop(),
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      isActive: true,
    };

    if (selected !== "All" && selected !== "") {
      requestBody.registrationType = selected;
    }

    fetch(`http://183.83.219.144:81/LMS/Notification/SaveNotification`, {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData) {
          alert("sent notification");
          setTitle("");
          setDescription("");
          setFile("");
          setImg("");
        } else {
          alert("failed to send notification");
          setTitle("");
          setDescription("");
          setFile("");
          setImg("");
        }
        console.log("response from savenotification:", responseData);
        setLoading(false);
      })
      .catch((error) => console.log(error));
    // navigate('/notifications');
    // document.getElementById("notification-form").reset();
  }

  file && reader.readAsDataURL(file);
  reader.onload = () => {
    // console.log('called: ', reader)
    setImg(reader.result);
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
        <div className="notification-container d-flex ">
          <form className="notification-form ">
            <h4 className="font-weight-bold ">Send Notifications</h4>
            <div className="d-flex mt-2 justify-content-around">
              <label className="mb-0 mr-2 ">Company:</label>
              <select
                className=""
                name="dropdown"
                onChange={(event) => {
                  setSelectedCompany(event.target.value);
                  console.log("dropdown changed to ", event.target.value);
                }}
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
              <label className="mb-0 mx-2">Type:</label>
              <select
                name="dropdown"
                onChange={(event) => {
                  setSelected(event.target.value);
                }}
              >
                {!registrationtypes.message && (
                  <>
                    <option value="All">All</option>
                    {registrationtypes
                    // ?.slice(1)
                    ?.map((type) => (
                      <option
                        key={type.registrationTypeId}
                        value={type.registrationTypeId}
                      >
                        {type.registrationTypeName}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
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
              alt="preview"
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
              onClick={handleNotify}
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
          <p style={{ marginTop: 10 }}>
            Click{" "}
            <a
              href={`/notifyusers`}
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              here
            </a>{" "}
            to notify selected users
          </p>
        </div>
      )}
    </>
  );
};

export default Notifications;
