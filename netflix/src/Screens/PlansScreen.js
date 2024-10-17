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

  useEffect(() => {
    const fetchProducts = async () => {
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
        products[productDoc.id] = { ...productData, prices: prices };
      });

      setProducts(products);
    };

    fetchProducts();
  }, []);

  console.log(products);

  const loadCheckout = async (priceId) => {
    const customerDocRef = doc(db, "customers", user.uid);
    const checkoutSessionRef = collection(customerDocRef, "checkout_sessions");
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
          "pk_test_51QAEooGYqsIUMffytohiyfWWHRYlNsnMYdtCpZ4IjvWuPPWR0sO9UmSLsLOa4QbJ3CJM7uAiYJyPDw2kPTeuG500OPZLSLJX"
        );
        stripe.redirectToCheckout({ sessionId });
      }
    });
  };

  return (
    <div className="plansScreen">
      {Object.entries(products).map(([productId, productData]) => {
        return (
          <div className="plansScreen__plan" key={productId}>
            <div className="plansScreen__info">
              <h5>{productData.name}</h5>
              <h6>{productData.description}</h6>
            </div>
            {productData.prices &&
              productData.prices.map((price) => (
                <button
                  key={price.priceId}
                  onClick={() => loadCheckout(price.priceId)}
                >
                  Subscribe
                </button>
              ))}
          </div>
        );
      })}
    </div>
  );
}

export default PlansScreen;
