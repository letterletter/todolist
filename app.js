const Koa = require('koa');
const static = require('koa-static');
const bodyParser = require('koa-bodyparser');
const views = require('koa-views');
const router = require('koa-router')();
const path = require('path');
const app = new Koa();

let unfinished = 1;
let currentPage = 'index';
let checkAll = false
let todoList = [
  { id: '1', title: '完成项目一', status: 'active' }
];

app.use(bodyParser());
app.use(views(path.join(__dirname, './views'), {
  extension: 'ejs',
}))

app.use(static(path.join(__dirname, '/public')))


router.get('/', async (ctx, next) => {
  currentPage = 'index';
  await ctx.render('index', { dataList: todoList, unfinished, pathname: '/', checkAll })
})

router.get('/active', async (ctx) => {
  currentPage = 'active';
  await ctx.render('index', {
    dataList: todoList.filter(item => item.status === 'active'),
    unfinished,
    pathname: ctx.request.url,
    checkAll
  });
})

router.get('/complete', async (ctx) => {
  currentPage = 'complete';
  await ctx.render('index', {
    dataList: todoList.filter(item => item.status !== 'active'),
    unfinished,
    pathname: ctx.request.url,
    checkAll
  });
})

router.post('/save', async (ctx) => {
  const { title } = ctx.request.body;
  if(!title) return;
  todoList.push({ id: Math.random().toString(36).slice(6), title, status: 'active' });
  ++unfinished;
  checkAll = unfinished <= todoList.length ? false : true; 
  let pathname = currentPage === 'index' ? '/' : '/' + currentPage;
  await ctx.redirect(pathname);
})

router.get('/changeStatus/:id', async (ctx) => {
  let { id } = ctx.params;
  let findItem = todoList.find(item => item.id === id);
  if(!findItem) return;

  findItem.status === 'active' ? (--unfinished) : (++unfinished);
  findItem.status = findItem.status === 'active' ? 'complete' : 'active';
  // 能找到这一项，表明todo项大于0，未完成的个数等于0, 为true
  checkAll = unfinished === 0 ? true : false; 
  let pathname = currentPage === 'index' ? '/' : '/' + currentPage;
  await ctx.redirect(pathname);
})

router.get('/checkall', async (ctx) => {
  checkAll = !checkAll;
  let pathname = currentPage === 'index' ? '/' : '/' + currentPage;
  changeTodoList(checkAll, currentPage)
  await ctx.redirect(pathname);
})

router.post('/delete', async (ctx) => {
  let { id } = ctx.request.body;
  let index = todoList.findIndex(item => item.id === id);
  if (index >= 0) {
    todoList[index].status === 'active' && --unfinished
    todoList.splice(index, 1);
    let pathname = currentPage === 'index' ? '/' : '/' + currentPage;
    await ctx.redirect(pathname)
  } else {
    ctx.body = `no item exist with ${id}`;
  }
})


app.use(router.routes()).use(router.allowedMethods())

app.listen(3000);

function changeTodoList(checked, currentPage) {
  let status = checked ? 'complete' : 'active';
  unfinished = checked ? 0 : todoList.length;
  todoList.forEach(element => {
    element.status = status
  });
}