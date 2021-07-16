import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { TinkAPI } from './tink-api.js';

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

    console.log(await TinkAPI.accounts());
  } catch (e) {
    console.log(e);
  }

  ctx.response.status = 200;

  ctx.response.body = { msg: 'working' }
})


// app.use(router.routes())
// app.use(router.allowedMethods())

// app.addEventListener('listen', (ctx) => {
//   console.log(`Listening at `, ctx.hostname, ctx.port);
// })

// await app.listen("127.0.0.1:8000");

// await TinkAPI.auth()
// console.log(await TinkAPI.accounts());