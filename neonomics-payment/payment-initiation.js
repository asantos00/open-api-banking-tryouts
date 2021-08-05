import { getIP } from "https://deno.land/x/get_ip/mod.ts";

const NeonomicsAPI = {
  token: null,
  sessionId: null,

  auth() {
    const form = new URLSearchParams()
    form.append('grant_type', 'client_credentials')
    form.append('client_id', '')
    form.append('client_secret', '')

    return fetch('https://sandbox.neonomics.io/auth/realms/sandbox/protocol/openid-connect/token', {
      method: 'POST',
      body: form,
      headers: [
        ['content-type', 'application/x-www-form-urlencoded']
      ]
    }).then(r => r.json())
    .then(authResponse => {
      console.log(authResponse)
      this.token = authResponse;
    })
    .catch(e => console.error(e))
  },

  getBanks() {
    return fetch('https://sandbox.neonomics.io/ics/v3/banks', {
      headers: [
        ['content-type', 'application/json'],
        ['Authorization',  `Bearer ${this.token.access_token}`],
        ['x-device-id', 'test-device-id']
      ]
    })
    .then(r => r.json());
  },

  createSessionInBank(bankId) {
    return fetch('https://sandbox.neonomics.io/ics/v3/session', {
      method: 'POST',
      headers: [
        ['content-type', 'application/json'],
        ['Authorization',  `Bearer ${this.token.access_token}`],
        ['x-device-id', 'test-device-id']
      ],
      body: JSON.stringify({ bankId })
    })
    .then(r => r.json())
    .then(session => {
      this.sessionId = session.sessionId;
    })
  },

  async getConsent({ type, href }) {
    return fetch(href, {
      method: type,
      headers: [
        ['Accept', 'application/json'],
        ['Authorization',  `Bearer ${this.token.access_token}`],
        ['x-device-id', 'test-device-id'],
        ['x-psu-ip-address', await getIP()],
        ['x-session-id', this.sessionId],
        ['x-redirect-url', 'https://tx723rmp7d.sharedwithexpose.com/callback'],
      ]
    }).then(r => r.json())
    .then(r => {
      if (r.links) {
        return r.links[0].href;
      }
    });
  },

  async getAccountData() {
    return fetch('https://sandbox.neonomics.io/ics/v3/accounts', {
      headers: [
        ['content-type', 'application/json'],
        ['Accept', 'application/json'],
        ['Authorization',  `Bearer ${this.token.access_token}`],
        ['x-device-id', 'test-device-id'],
        ['x-psu-ip-address', await getIP()],
        ['x-session-id', this.sessionId]
      ],
    })
    .then(r => r.json())
    .then(r => {
      console.log('hello', r)
      if (r.type === 'CONSENT') {
        return this.getConsent(r.links[0])
      }

      return r;
    })
  },

  async completePayment(paymentId) {
    console.log('Completing payment with', this.sessionId, paymentId)
    return fetch(`https://sandbox.neonomics.io/ics/v3/payments/sepa-credit/${paymentId}/complete`, {
      headers: [
        ['content-type', 'application/json'],
        ['Accept', 'application/json'],
        ['Authorization',  `Bearer ${this.token.access_token}`],
        ['x-device-id', 'test-device-id'],
        ['x-psu-ip-address', await getIP()],
        ['x-session-id', this.sessionId],
        ['content-length', 0]
      ],
      method: 'POST',
    })
    .then(r => r.json())

  },

  async pay() {
    return fetch('https://sandbox.neonomics.io/ics/v3/payments/sepa-credit', {
      headers: [
        ['content-type', 'application/json'],
        ['Accept', 'application/json'],
        ['Authorization',  `Bearer ${this.token.access_token}`],
        ['x-device-id', 'test-device-id'],
        ['x-psu-ip-address', await getIP()],
        ['x-session-id', this.sessionId]
      ],
      method: 'POST',
      body: JSON.stringify({
        "creditorAccount": {
          "iban": "NO6590412329715"
        },
        "debtorAccount": {
          "iban": "NO2390412263056"
        },
        "debtorName": "Juanita Doe",
        "creditorName": "John Smit",
        "remittanceInformationUnstructured": "My test payment",
        "instrumentedAmount": "100.00",
        "currency": "EUR",
        "endToEndIdentification": "example-123456789-id",
        "paymentMetadata": {}
      })
    })
    .then(r => r.json())
    .then(r => {
      if (r.type === 'CONSENT') {
        return this.getConsent(r.links[0])
      }

      return r;
    })
  }

}

await NeonomicsAPI.auth();

const MY_BANK = {
  countryCode: "NO",
  bankingGroupName: "Sbanken",
  personalIdentificationRequired: false,
  id: "U2Jhbmtlbi52MVNCQUtOT0JC",
  bankDisplayName: "Sbanken",
  supportedServices: [ "sepa-credit", "domestic-transfer", "accounts" ],
  bic: "SBAKNOBB",
  bankOfficialName: "Sbanken ASA",
  status: "AVAILABLE"
}


// console.log(await NeonomicsAPI.getBanks());

// throw new Error('banks')

await NeonomicsAPI.createSessionInBank(MY_BANK.id);
console.log(await NeonomicsAPI.getAccountData());

if(!confirm('do you already have consent?')) {
  throw new Error('Consent is needed')
}


//https://developer.neonomics.io/documentation/payments/domestic-transfer
console.log(await NeonomicsAPI.pay());

const paymentId = prompt('\npaymentId\n:');

console.log(await NeonomicsAPI.completePayment(paymentId))

