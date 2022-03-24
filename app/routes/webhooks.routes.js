const stripe = require("stripe");
const express = require("express");
const endpointSecret =
  "whsec_f2f42c68330a0eeba357bb0868a31d962cef6e05109a70d0839bfdca9d7bb38f";

module.exports = function (app) {
  app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    (request, response) => {
      const sig = request.headers["stripe-signature"];

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          sig,
          endpointSecret
        );
      } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;

          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      response.send();
    }
  );
};
