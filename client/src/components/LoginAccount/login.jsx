import React, { useRef } from "react";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord,faGoogle } from "@fortawesome/free-brands-svg-icons"
const Login = () => {
  const usernameRef = useRef();
  const passwordRef = useRef();
  const history = useHistory();
  const handleOnSubmit = async () => {
    if (usernameRef.current.value === "") return;
    if (passwordRef.current.value === "") return;
    console.log(usernameRef.current.value, passwordRef.current.value);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: usernameRef.current.value,
        password: passwordRef.current.value
      })
    };
    const response = await fetch("/api/auth/local/login", options);
    const data = await response.json();
    if (!data) throw new Error("Bad Login");
    if (data.ok) history.push("/");
  };
  return (
    <div>
      <h2 className="title is2">Login</h2>
      <div className="columns">
        <div className="column is-third"></div>
        <div className="column is-third">
          <div className="field">
            <p className="control has-icons-left">
              <input
                className="input"
                type="username"
                placeholder="username"
                ref={usernameRef}
              ></input>
	      <span className="icon is-left">
      		<FontAwesomeIcon icon="user" />	
	      </span>
            </p>
          </div>

          <p></p>
          <div className="field">
            <p className="control has-icons-left">
              <input
                className="input"
                type="password"
                placeholder="password"
                ref={passwordRef}
              ></input>
	      <span className="icon is-left">
      		<FontAwesomeIcon icon="lock" />	
	      </span>
            </p>
          </div>

          <p></p>
          <h6 className="title"></h6>
          <input
            type="submit"
            className="button is-danger"
            onClick={handleOnSubmit}
          ></input>
        </div>
        <div className="column is-third"></div>
      </div>

      <p></p>
      <h6 className="title"></h6>
      <button onClick={()=>{window.location = "/api/auth/discord/login"}} className="button is-normal">
	  <span className="icon is-left">
	  <FontAwesomeIcon icon={faDiscord} />
	  </span>
	  <span>
	  Login with discord
	  </span>
      </button>
      <p></p>

      <button onClick={()=>{ window.location="/api/auth/google/login"}} className="button is-normal">
	  <span className="icon is-left">
	  <FontAwesomeIcon icon={faGoogle} />
	  </span>
	  <span>
	  Login with Google
	  </span>
        
      </button>
      <h2 className="title is-2"></h2>
      <p></p>
      <a href="/createAccount" className="button is-normal">
        Create Account
      </a>
    </div>
  );
};

export default Login;
