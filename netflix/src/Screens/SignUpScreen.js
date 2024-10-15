import React, { useRef } from "react";
import "./SignUpScreen.css";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";

function SignUpScreen() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const register = (e) => {
    e.preventDefault();

    createUserWithEmailAndPassword(
      auth,
      emailRef.current.value,
      passwordRef.current.value
    )
      .then((authUser) => {
        // Handle successful registration
        console.log(authUser);
      })
      .catch((error) => {
        // Handle errors here
        console.error(error);
      });
  };

  const signIn = (e) => {
    e.preventDefault();
    // Add sign-in logic here

    signInWithEmailAndPassword(
      auth,
      emailRef.current.value,
      passwordRef.current.value
    )
      .then((authUser) => {
        // Handle successful sign-in
        console.log(authUser);
      })
      .catch((error) => {
        // Handle errors here
        console.error(error);
      });
  };

  return (
    <div className="signUpScreen">
      <form>
        <h1>Sign In</h1>
        <input ref={emailRef} type="email" placeholder="Email" />
        <input ref={passwordRef} type="password" placeholder="Password" />
        <button onClick={signIn} type="submit">
          Sign In
        </button>

        <h4>
          <span className="signUpScreen__gray">New to Netflix? </span>
          <span onClick={register} className="signUpScreen__link">
            Sign up now.
          </span>
        </h4>
      </form>
    </div>
  );
}

export default SignUpScreen;
