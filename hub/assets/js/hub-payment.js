(function () {

  var STRIPE_PAYMENT_LINK = "";

  function setStripeLink(url) {
    STRIPE_PAYMENT_LINK = url;
    if (url) {
      try { sessionStorage.setItem("p1hub_stripe_link", url); } catch (e) {}
    }
  }

  function getStripeLink() {
    if (STRIPE_PAYMENT_LINK) return STRIPE_PAYMENT_LINK;
    try { return sessionStorage.getItem("p1hub_stripe_link") || ""; } catch (e) { return ""; }
  }

  function createOrder(clientId, projectId, amount) {
    return db.collection("hub_orders").add({
      clientId: clientId,
      projectId: projectId,
      amount: amount || 0,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  function confirmOrder(orderId) {
    return db.collection("hub_orders").doc(orderId).update({
      status: "paid",
      paidAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  function checkProjectPayment(clientId, projectId) {
    return db.collection("hub_orders")
      .where("clientId", "==", clientId)
      .where("projectId", "==", projectId)
      .where("status", "==", "paid")
      .limit(1)
      .get()
      .then(function (snapshot) {
        return !snapshot.empty;
      });
  }

  function getClientIdByEmail(email) {
    return db.collection("hub_clients")
      .where("email", "==", email)
      .limit(1)
      .get()
      .then(function (snapshot) {
        if (snapshot.empty) return null;
        return snapshot.docs[0].id;
      });
  }

  window.HubPayment = {
    setStripeLink: setStripeLink,
    getStripeLink: getStripeLink,
    createOrder: createOrder,
    confirmOrder: confirmOrder,
    checkProjectPayment: checkProjectPayment,
    getClientIdByEmail: getClientIdByEmail
  };

})();
