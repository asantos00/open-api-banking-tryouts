import { TinkAPI } from './tink-api.js'
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use(async (ctx, next) => {
  console.log(ctx.request.method, ctx.request.url.href)
  await next();
});

const router = new Router()

router.get('/callback', async (ctx) => {
  // console.log(ctx.request.url, ctx.request.body().value);
  const code = ctx.request.url.searchParams.get('code')
  const credentialsId = ctx.request.url.searchParams.get('credentialsId');

  console.log({ code, credentialsId })
  try {
    await TinkAPI.auth(code);

    console.log(await TinkAPI.pay({ amount: 10 }));

  } catch (e) {
    console.log('error in accounts', e);
  }

  ctx.response.status = 200;

  ctx.response.body = { msg: 'working' }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.addEventListener('listen', (ctx) => {
  console.log(`Listening at `, ctx.hostname, ctx.port);
})

// function createPaymentLink() {
//   const BASE_LINK = new URL('https://link.tink.com/1.0/pay');

//   BASE_LINK.searchParams.append('client_id', TinkAPI.clientId);
//   BASE_LINK.searchParams.append('redirect_uri', 'https://d7aa938c6432.ngrok.io/callback');
//   BASE_LINK.searchParams.append('market', 'PT');
//   BASE_LINK.searchParams.append('locale', 'pt_PT');



// }

// createPaymentLink()

await app.listen("127.0.0.1:8000");


// console.log(await TinkAPI.createClientAccessToken());

