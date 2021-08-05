// Generate link
const form = new URLSearchParams()

form.append('client_id', TinkAPI.clientId);
form.append('client_secret', TinkAPI.clientSecret);
form.append('grant_type', 'client_credentials');
form.append('scope', 'authorization:grant');

const { access_token } = await fetch('https://api.tink.com/api/v1/oauth/token', {
  method: 'POST',
  headers: [['content-type', 'application/x-www-form-urlencoded']],
  body: form,
})