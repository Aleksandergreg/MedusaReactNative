import { Request, Response } from "express"
import Stripe from "stripe"

/**
 * This endpoint creates a Stripe Payment Intent and returns its client secret
 * to the React Native app
 */
export default async (req: Request, res: Response) => {
  try {
    if (!process.env.STRIPE_API_KEY) {
      throw new Error('Missing Stripe API key')
    }

    // Initialize Stripe with your secret key
    const stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: '2024-04-10'
    })

    const { amount, currency = 'usd', customer_id } = req.body

    if (!amount) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required parameter: amount' 
      })
    }

    // Create or retrieve customer
    let customer
    if (customer_id) {
      try {
        customer = await stripe.customers.retrieve(customer_id)
      } catch (error) {
        console.error('Error retrieving customer:', error)
        // If customer doesn't exist, we'll create a new one below
      }
    }

    if (!customer) {
      // Create a new customer
      customer = await stripe.customers.create({
        metadata: {
          medusa_customer_id: customer_id || 'guest'
        }
      })
    }

    // Generate an Ephemeral Key for this customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2022-11-15' }
    )

    // Create a Payment Intent
    console.log("Creating payment intent with amount:", Math.round(parseFloat(amount) * 100));
    
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Stripe uses cents
        currency: currency,
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true
        },
        metadata: {
          medusa_order_id: "temp_" + Date.now() // Temporary identifier until order is created
        }
      });

      console.log("Payment intent created:", {
        id: paymentIntent.id,
        hasClientSecret: !!paymentIntent.client_secret,
        clientSecretStartsWith: paymentIntent.client_secret ? paymentIntent.client_secret.substring(0, 10) + '...' : 'null',
        status: paymentIntent.status
      });
      
      if (!paymentIntent.client_secret || paymentIntent.client_secret === 'pi_test') {
        throw new Error("Invalid payment intent created");
      }
    
      // Return the data needed by the mobile app
      console.log("API Keys available:", {
        stripeApiKey: !!process.env.STRIPE_API_KEY,
        publishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY
      });
      
      // Use a hardcoded publishable key as fallback
      const publishableKey = "pk_test_51RQY8ARkqrA6nukbH9eJ6bQA5bC6oQ2zqzRdouqSSELk6o1uPrxHig2ZpMdbsCtvCjJYT5TLii2NsGhiYV23V6Ej00trL6piGu";
      
      res.status(200).json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: publishableKey // Use the hardcoded fallback key
      });
    } catch (stripeError) {
      console.error("Stripe payment intent creation error:", stripeError);
      throw stripeError;
    }

  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ 
      error: true, 
      message: error.message || 'Error creating payment intent'
    })
  }
} 