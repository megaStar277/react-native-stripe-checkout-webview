/* @flow */

/**
 * Generates HTML content that redirects to a Stripe checkout session
 */
const stripeCheckoutRedirectHTML = (
  stripe_public_key: string,
  input:
    | {
        sessionId: string,
      }
    | {
        clientReferenceId: string,
        successUrl: string,
        cancelUrl: string,
        items?: Array<{ plan: string, quantity: string }>,
      },
  options?: {
    /** The loading item is set on the element with id='sc-loading' */
    htmlContentLoading?: string,
    /** The error is set on the element with id='sc-error-message' */
    htmlContentError?: string,
  } = {},
): string => {
  if (!stripe_public_key) {
    throw new Error('Must provide Stripe public key.');
  }
  if (!input) {
    throw new Error('Must provide redirectToCheckout function input.');
  }

  /** Get options or defaults */
  const {
    htmlContentLoading = '<h1 id="sc-loading">Loading...</h1>',
    htmlContentError = '<div id="sc-error-message"></div>',
  } = options;

  /** Return html */
  return `
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Stripe Checkout</title>
      <meta name="author" content="A-Tokyo">  
    </head>
    <body>
      <!-- Load Stripe.js. -->
      <script src="https://js.stripe.com/v3"></script>
      <!-- Display loading content -->
      ${htmlContentLoading || ''}
      <!-- Display error content -->
      ${htmlContentError || ''}
      <!-- Stripe execution script -->
      <script>
        (function initStripeAndRedirectToCheckout () {
          const stripe = Stripe('${stripe_public_key}');
          window.onload = () => {
            // Redirect to Checkout
            stripe.redirectToCheckout(${JSON.stringify(input)})
              .then((result) => {
                // Remove loading html
                const loadingElement = document.getElementById('sc-loading');
                if (loadingElement) {
                  loadingElement.outerHTML = '';
                }
                // If redirectToCheckout fails due to a browser or network
                // error, display the localized error message to your customer.
                if (result.error) {
                  const displayError = document.getElementById('sc-error-message');
                  if (displayError) {
                    displayError.textContent = result.error.message;
                  }
                }
              });
          };
        })();
      </script>
    </body>
  </html>
  `;
};

export default stripeCheckoutRedirectHTML;