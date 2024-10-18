import React, { useEffect, useState } from "react";
import "./PlansScreen.css";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import db from "../firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { loadStripe } from "@stripe/stripe-js";

function PlansScreen() {
  const [products, setProducts] = useState([]);
  const user = useSelector(selectUser);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const customerDocRef = doc(db, "customers", user.uid);
        const subscriptionDocRef = collection(customerDocRef, "subscriptions");
        const querySnapshot = await getDocs(subscriptionDocRef);

        querySnapshot.forEach(async (subscription) => {
          setSubscription({
            role: subscription.data().role,
            current_period_end: subscription.data().current_period_end.seconds,
            current_period_start:
              subscription.data().current_period_start.seconds,
          });
        });
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    fetchSubscription(); // Corrected function call
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, "products");
        const q = query(productsCollection, where("active", "==", true));
        const querySnapshot = await getDocs(q);

        const products = {};
        querySnapshot.forEach(async (productDoc) => {
          const productData = productDoc.data();
          const priceSnap = await getDocs(collection(productDoc.ref, "prices"));
          const prices = priceSnap.docs.map((price) => ({
            priceId: price.id,
            priceData: price.data(),
          }));
          products[productDoc.id] = { ...productData, prices: prices }; // Ensure prices are set correctly
        });

        console.log("Fetched products:", products); // Debugging log
        setProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error); // Error handling
      }
    };

    fetchProducts();
  }, []);

  console.log("Products state:", products); // Debugging log
  console.log("Subscription state:", subscription); // Debugging log

  const loadCheckout = async (priceId) => {
    try {
      const customerDocRef = doc(db, "customers", user.uid); // Corrected method call
      const checkoutSessionRef = collection(
        customerDocRef,
        "checkout_sessions"
      );
      const checkoutSessionDoc = await addDoc(checkoutSessionRef, {
        price: priceId,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      });

      onSnapshot(checkoutSessionDoc, async (snap) => {
        const { error, sessionId } = snap.data();

        if (error) {
          alert(`An error occurred: ${error.message}`);
        }
        if (sessionId) {
          const stripe = await loadStripe(
            "pk_test_51QAEooGYqsIUMffytohiyfWWHRYlNsnMYdtCpZ4IjqpvWuPPWR0sO9UmSLsLOa4QbJ3CJM7uAiYJyPDw2kPTeuG500OPZLSLJX"
          );
          stripe.redirectToCheckout({ sessionId });
        }
      });
    } catch (error) {
      console.error("Error loading checkout:", error); // Error handling
    }
  };

  return (
    <div className="plansScreen">
      {subscription && (
        <p>
          Renewal date:{" "}
          {new Date(
            subscription?.current_period_end * 1000
          ).toLocaleDateString()}
        </p>
      )}
      {Object.entries(products).map(([productId, productData]) => {
        console.log("Rendering product:", productData); // Debugging log

        const isCurrentPackage = productData.name
          ?.toLowerCase()
          .includes(subscription?.role);
        return (
          <div
            className={`${
              isCurrentPackage && "plansScreen__plan--disable"
            }plansScreen__plan`}
            key={productId}
          >
            <div className="plansScreen__info">
              <h5>{productData.name}</h5>
              <h6>{productData.description}</h6>
            </div>
            <button
              onClick={() =>
                !isCurrentPackage && loadCheckout(productData.prices[0].priceId)
              }
            >
              {isCurrentPackage ? "Current Package" : "Subscribe"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default PlansScreen;
