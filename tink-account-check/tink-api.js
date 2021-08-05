export const TinkAPI = {
  baseURL: 'https://api.tink.com',

  clientId: '',
  clientSecret: '',
  token: null,

  auth(code) {
    console.log('starting auth');
    if (this.token) {
      console.log('Already have a token')
      return this.token;
    }

    const form = new URLSearchParams()

    form.append('code', code);
    form.append('client_id', this.clientId);
    form.append('client_secret', this.clientSecret);
    form.append('grant_type', 'authorization_code');
    // form.append('scope', 'accounts:read,accounts:write,payment:read,payment:write')

    return fetch(`${this.baseURL}/api/v1/oauth/token`, { body: form, headers: [['content-type', 'application/x-www-form-urlencoded']], method: 'POST' })
      .then(async (r) => {
        console.log(r.statusText, r.url)
        if (r.status >= 200 && r.status < 500) {
          return r.json();
        } else {
          throw new Error('err');
        }
      })
      .then(response => {
        console.log('my response', response)
        console.log('setting this token', this.token, response)
        console.log('this', this);
        this.token = response;

        console.log('TOKEN', response.access_token)
        return response;
      })
  },

  accounts() {
    console.log(this.token);
    return fetch(`${this.baseURL}/data/v2/accounts`, {
      headers: [
        ['Authorization', `Bearer ${this.token.access_token}`]
      ]
    }).then(r => r.json())
  },

  createSession({ fromIban }) {
    return fetch(`${this.baseURL}/link/v1/session`, {
      method: 'POST',
      headers: [
        ['Authorization', `Bearer ${this.token.access_token}`],
        ['Content-Type', 'application/json']
      ],
      body: JSON.stringify({ source_account_number: `iban://${fromIban}` })
    }).then(r => r.json())
  },

  checkPaymentRequest(id) {
    return fetch(`${this.baseURL}/api/v1/payments/requests/${id}`, {
      headers: [
        ['Authorization', `Bearer ${this.token.access_token}`],
        ['Content-Type', 'application/json']
      ],
    }).then(r => r.json())
  },

  checkPaymentRequestTransfers(id) {
    return fetch(`${this.baseURL}/api/v1/payments/requests/${id}/transfers`, {
      headers: [
        ['Authorization', `Bearer ${this.token.access_token}`],
        ['Content-Type', 'application/json']
      ],
    }).then(r => r.json())
  },

  getAllTransfers() {
    return fetch(`${this.baseURL}/api/v1/payments/requests/all`, {
      method: 'POST',
      headers: [
        ['Authorization', `Bearer ${this.token.access_token}`],
        ['Content-Type', 'application/json']
      ],
      body: JSON.stringify({ date: '2021-08-04' })
    }).then(r => r.json())
  },

  providers({ market }) {
    return fetch(`${this.baseURL}/api/v1/providers/${market}`, {
      headers: [
        ['Authorization', `Bearer ${this.token.access_token}`],
        ['Content-Type', 'application/json']
      ],
    }).then(r => r.json())
  },

  // https://docs.tink.com/resources/tink-link-web/tink-link-web-api-reference-payment-initiation
  pay({ amount, recipient, toIban }) {
    return fetch(`${this.baseURL}/api/v1/payments/requests`, {
      method: 'POST',
      body: JSON.stringify(

        {
          "destinations": [
             {
                "accountNumber": toIban,
                "type": "iban"
             }
          ],
          "amount": amount,
          "currency": "EUR",
          "market": "PT",
          "recipientName": recipient,
          "remittanceInformation": {
             "type": "UNSTRUCTURED",
             "value": "Top-up"
           },
           "paymentScheme": "SEPA_INSTANT_CREDIT_TRANSFER"
         }
      ),
      headers: [
        ['Authorization', `Bearer ${this.token.access_token}`],
        ['Content-Type', 'application/json']
      ]
    })
      .then(async (r) => {
        console.log(r.statusText, r.url, r.headers)
        if (r.status >= 200 && r.status < 400) {
          return r;
        } else {
          // console.log('text', await r.formData())
          // console.log(await r.text())
          throw new Error('err');
        }
      }).then(r => r.json())
  }

}