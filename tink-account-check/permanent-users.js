import { TinkAPI } from './tink-api.js'
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use(async (ctx, next) => {
  console.log(ctx.request.method, ctx.request.url.href)
  await next();
});

const router = new Router()

router.get('/callback', async (ctx) => {
  // // console.log(ctx.request.url, ctx.request.body().value);
  // const code = ctx.request.url.searchParams.get('code')
  // const credentialsId = ctx.request.url.searchParams.get('credentialsId');

  // console.log({ code, credentialsId })
  // try {
  //   await TinkAPI.auth(code);

  //   console.log(await TinkAPI.pay({ amount: 10 }));

  // } catch (e) {
  //   console.log('error in accounts', e);
  // }
  console.log(ctx.request.url.searchParams)

  ctx.response.status = 200;

  ctx.response.body = { msg: 'working' }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.addEventListener('listen', (ctx) => {
  console.log(`Listening at `, ctx.hostname, ctx.port);
})

async function createPaymentLink() {
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

  console.log('My access token', access_token);


  const BASE_LINK = new URL('https://link.tink.com/1.0/transactions/connect-accounts');

  BASE_LINK.searchParams.append('client_id', TinkAPI.clientId);
  BASE_LINK.searchParams.append('redirect_uri', 'https://tx723rmp7d.sharedwithexpose.com/callback');
  BASE_LINK.searchParams.append('market', 'PT');
  BASE_LINK.searchParams.append('locale', 'en_US');
  BASE_LINK.searchParams.append('test', 'true');

  console.log(BASE_LINK.toJSON())
}

// await createPaymentLink()

await app.listen("127.0.0.1:3000");


// console.log(await TinkAPI.createClientAccessToken());

