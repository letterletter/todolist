const Koa = require('koa');
const static = require('koa-static');
const bodyParser = require('koa-bodyparser');
const views = require('koa-views');
const router = require('koa-router')();
const path = require('path');
const app = new Koa();
const Handler = require('./handler');

let currentPage = '/'
app.use(bodyParser());

app.use(static(path.join(__dirname, '/public')));

app.use(views(path.join(__dirname, './views'), {
  extension: 'ejs',
}));

// active,completed, edit
router.get('/:type', async (ctx, next) => {
  let trueType = ctx.request.url.split('?')[0].substr(1)
  if (Handler.support.includes(trueType)) {
    Handler.changeTodoList(trueType, { ...ctx.request.params, ...ctx.query })
    await ctx.redirect(currentPage);
  }
  else await next();
})

router.get('/getAllData', async (ctx) => {
  let data = new Array(7).fill(0).map(i => ({ a: i, b: i + 1, title: 'ddd' + i }))
  ctx.body = JSON.stringify(data)
})
// save保存，saveEdit保存编辑，delete删除，changeActive改变完成状态
router.post('/:action', async (ctx) => {
  Handler.changeTodoList(ctx.request.params.action, { ...ctx.request.body, ...ctx.request.params })
  await ctx.redirect(currentPage);
})

// 保存编辑，编辑提交后，title为‘’时，进行删除
router.post('/saveEdit/:id', async ctx => {
  Handler.changeTodoList('saveEdit', { ...ctx.request.body, ...ctx.request.params })
  await ctx.redirect(currentPage);
})

// 设置当前页，“/”所有todo项页或/active未完成，或/complete已完成页
app.use(async (ctx, next) => {
  let pageListUrl = ['/', '/active', '/completed'];
  pageListUrl.includes(ctx.request.url) && (currentPage = ctx.request.url)
  await next();
})

app.use(router.routes()).use(router.allowedMethods());

app.use(async (ctx, next) => {
  let map = { '/active': false, '/completed': true }
  let model = Handler.TodoModel
  let dataList = currentPage === '/' ? model.todoList : model.todoList.filter(item => item.completed === map[currentPage])
  await ctx.render('index', {
    ...Handler.TodoModel,
    dataList,
    pathname: currentPage,
    todoLength: model.todoList.length
  });
})
app.listen(3333);
