export const TinkAPI = {
  baseURL: 'https://api.tink.com',

  clientId: '',
  clientSecret: '',
  token: null,

  auth(code) {
    console.log('starting auth');
    // if (this.token) {
    //   return this.token;
    // }

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

  pay({ amount }) {
    return fetch(`${this.baseURL}/api/v1/payments/requests`, {
      method: 'POST',
      body: JSON.stringify(

        {
          "destinations": [
             {
                "accountNumber": "PT57099843891892236827523",
                "type": "iban"
             }
          ],
          "amount": 10,
          "currency": "EUR",
          "market": "PT",
          "recipientName": "pt-test-open-banking-redirect-payment-successful",
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