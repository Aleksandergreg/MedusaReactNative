import { Router } from "express"
import paymentIntent from "./routes/payment-intent"

// Export a function that will use the router passed
// from the Express server in Medusa
export default (router: Router) => {
  // Define a POST endpoint at /payment-intent
  router.post("/payment-intent", paymentIntent)
} 