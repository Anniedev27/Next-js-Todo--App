import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Sign Up (with Email Verification)
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Send verification email
    await sendEmailVerification(user);
    console.log("Verification email sent. Please check your inbox.");

    return {
      success: true,
      message:
        "Sign-up successful! Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("Error signing up:", error.message);
    return { success: false, message: error.message };
  }
};

// Log In (Restrict Unverified Users)
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      console.error("Email not verified. Please check your email.");
      return {
        success: false,
        message: "Please verify your email before logging in.",
      };
    }

    console.log("User logged in:", user);
    return { success: true };
  } catch (error) {
    console.error("Error logging in:", error.message);
    return { success: false, message: error.message };
  }
};

// Resend Verification Email
export const resendVerificationEmail = async () => {
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      return {
        success: true,
        message: "Verification email resent. Check your inbox.",
      };
    } else {
      return { success: false, message: "No user logged in." };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Log Out
export const logOut = async (router) => {
  try {
    await signOut(auth);
    router.push("/login"); // ✅ Redirect to login page after logout
  } catch (error) {
    console.error("Error logging out:", error.message);
  }
};
