// import React, { useState } from "react";

// const AdminRegister = () => {
//   const [inputs, setInputs] = useState({
//     username: "",
//     password: ""
//   });

//   const { username, password } = inputs;

//   const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

//   const onSubmitForm = async (e) => {
//     e.preventDefault();
//     try {
//       const body = { username, password };
      
//       // CALL THE ADMIN REGISTER ROUTE
//       const response = await fetch("http://localhost:5000/admin/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body)
//       });

//       const parseRes = await response.json();

//       if (response.ok) {
//         alert("Admin Created Successfully! Now go login.");
//         window.location.href = "/admin-login"; // Redirect to login
//       } else {
//         alert("Error creating admin");
//       }
//     } catch (err) {
//       console.error(err.message);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card" style={{border: "2px solid red"}}>
//         <h2 style={{color: "red"}}>Create FIRST Admin</h2>
//         <p>Use this once, then delete this file!</p>
//         <form onSubmit={onSubmitForm} autoComplete="off">
//           <input
//             type="text"
//             name="username"
//             placeholder="New Admin Username"
//             className="form-control"
//             value={username}
//             onChange={onChange}
//             required
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="New Admin Password"
//             className="form-control"
//             value={password}
//             onChange={onChange}
//             required
//           />
//           <button className="btn-primary" style={{backgroundColor: "red"}}>Register Admin</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AdminRegister;