import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use(async (ctx, next) => {
  console.log(ctx.request.method, ctx.request.url.href)
  await next();
});

const router = new Router()

router.get('/callback', async (ctx) => {
  // console.log(ctx.request.url, ctx.request.body().value);
  const resourceId = ctx.request.url.searchParams.get('resource_id')
  const result = ctx.request.url.searchParams.get('result');

  console.log({ resourceId, result })

  ctx.response.status = 200;

  ctx.response.body = { msg: 'working' }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.addEventListener('listen', (ctx) => {
  console.log(`Listening at `, ctx.hostname, ctx.port);
})

await app.listen("127.0.0.1:8000");