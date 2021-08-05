import { TinkAPI } from "./tink-api.js";
import { getOAuthToken } from './oauth.js';

const token = await getOAuthToken();
console.log('Got my token', token);

TinkAPI.token = token;

// const paymentRequestChecked = await TinkAPI.checkPaymentRequest('0e81fa90f52011eba36f5f65e30e4396');
// console.log('check payment request', paymentRequestChecked)

// const paymentRequestTransfers = await TinkAPI.checkPaymentRequestTransfers('0e81fa90f52011eba36f5f65e30e4396');
// console.log('check payment request', paymentRequestTransfers)

// const reconciliation = await TinkAPI.getAllTransfers()
// console.log('reconciliation', reconciliation)

const { sessionId } = await TinkAPI.createSession({ fromIban: 'PT50003504260004492600049' })
console.log('My session id', sessionId);

const paymentRequest = await TinkAPI.pay({ amount: 7.5, toIban: 'PT50003504260002632480034', recipient: 'Fatima Portela dos Santos' });
console.log('Payment request', paymentRequest);



// const { providers } = await TinkAPI.providers({ market: 'PT'});
// providers.forEach(p => {
//   console.log(p.name, p.financialServices, p.capabilities, p.displayName, 'has transfer', p.capabilities.includes('TRANSFERS'))
// })

const BASE_LINK = new URL('https://link.tink.com/1.0/pay');

// https://docs.tink.com/resources/tink-link-web/tink-link-web-api-reference-payment-initiation
BASE_LINK.searchParams.append('client_id', TinkAPI.clientId);
BASE_LINK.searchParams.append('redirect_uri', 'https://tx723rmp7d.sharedwithexpose.com/callback');
BASE_LINK.searchParams.append('market', 'PT');
BASE_LINK.searchParams.append('locale', 'en_US');

// https://docs.tink.com/resources/payments/payment-initiation-examples#create-a-payment-request-in-portugal
BASE_LINK.searchParams.append('payment_request_id', paymentRequest.id);
// BASE_LINK.searchParams.append('session_id', sessionId);

// https://docs.tink.com/resources/tink-link-web/tink-link-web-api-reference-payment-initiation
BASE_LINK.searchParams.append('input_provider', 'pt-demobank-password');
// BASE_LINK.searchParams.append('test', 'true');

console.log(BASE_LINK.toJSON())