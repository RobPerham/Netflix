import React, { useEffect, useState } from "react";
import "./PlansScreen.css";
import { collection, query, where, getDocs } from "firebase/firestore";
import db from "../firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice"; // Correct import path
import { loadStripe } from "@stripe/stripe-js";

function PlansScreen() {
  const [products, setProducts] = useState([]);
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, "products");
      const q = query(productsCollection, where("active", "==", true));
      const querySnapshot = await getDocs(q);

      const products = {};
      querySnapshot.forEach(async (productDoc) => {
        products[productDoc.id] = productDoc.data();
        const priceSnap = await getDocs(collection(productDoc.ref, "prices"));
        priceSnap.docs.forEach((price) => {
          products[productDoc.id] = {
            priceId: price.id,
            priceData: price.data(),
          };
        });
      });

      setProducts(products);
    };

    fetchProducts();
  }, []);

  console.log(products);

  const loadCheckout = (priceId) => {
    // load stripe checkout
    const docRef = collection(db, "customers").doc(user.uid);
    // Corrected path to customers collection
    docRef.collection("checkout_sessions").add({
      price: priceId,
      success_url: window.location.origin,
      cancel_url: window.location.origin,
    });

    docRef.onSnapshot(async (snap) => {
      const { error, sessionId } = snap.data();

      if (error) {
        // show an error to your customer and
        // inspect your Cloud Function logs in the Firebase console
        alert(`An error occured: ${error.message}`);
      }
      if (sessionId) {
        // We have a session, let's redirect to Checkout
        // Init Stripe
        const stripe = await loadStripe(
          "pk_test_51QAEooGYqsIUMffytohiyfWWHRYlNsnMYdtCpZ4IjqpvWuPPWR0sO9UmSLsLOa4QbJ3CJM7uAiYJyPDw2kPTeuG500OPZLSLJX"
        );
        stripe.redirectToCheckout({ sessionId });
      }
    });
  };

  return (
    <div className="plansScreen">
      {Object.entries(products).map(([productId, productData]) => {
        // add some logic to check if user's subscription is active
        return (
          <div className="plansScreen__plan" key={productId}>
            <div className="plansScreen__info">
              <h5>{productData.name}</h5>
              <h6>{productData.description}</h6>
            </div>
            <button onClick={() => loadCheckout(productData.priceId)}>
              Subscribe
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default PlansScreen;
