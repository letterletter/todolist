const Koa = require('koa');
const static = require('koa-static');
const bodyParser = require('koa-bodyparser');
const views = require('koa-views');
const router = require('koa-router')();
const path = require('path');
const app = new Koa();

let unfinished = 0; // 未完成个数
let currentPage = '/'; // '/' || '/active' || '/complete'
let checkAll = false;
let todoList = [];
let editId = '';

app.use(bodyParser());

app.use(static(path.join(__dirname, '/public')));

app.use(views(path.join(__dirname, './views'), {
  extension: 'ejs',
}));

router.get('/', async (ctx, next) => {
  await ctx.render('index', { 
    dataList: todoList, 
    pathname: '/', 
    unfinished, 
    checkAll, 
    editId,
    todoLength: todoList.length 
  });
})

router.get('/active', async (ctx) => {

  await ctx.render('index', {
    dataList: todoList.filter(item => item.status === 'active'),
    pathname: ctx.request.url,
    unfinished,
    checkAll,
    editId,
    todoLength: todoList.length
  });
})

router.get('/complete', async (ctx) => {

  await ctx.render('index', {
    dataList: todoList.filter(item => item.status !== 'active'),
    pathname: ctx.request.url,
    unfinished,
    checkAll,
    editId,
    todoLength: todoList.length
  });
})

router.get('/clearComplete', async (ctx) => {
  todoList = todoList.filter(item => item.status === 'active');
  checkAll = false;
  await ctx.redirect(currentPage);
})

router.post('/save', async (ctx) => {

  const { title } = ctx.request.body;
  if (title.trim()) {
    todoList.push({ id: Math.random().toString(36).slice(6), title: title.trim(), status: 'active' });
    ++unfinished;
    checkAll = false; 
  }
  await ctx.redirect(currentPage);
})

router.get('/changeStatus/:id', async (ctx) => {

  let { id } = ctx.params;
  let findItem = todoList.find(item => item.id === id);
  if(!findItem) return;

  findItem.status === 'active' ? (--unfinished) : (++unfinished);
  findItem.status = findItem.status === 'active' ? 'complete' : 'active';
  // 能找到这一项，表明todo项大于0，未完成的个数等于0, 为true
  checkAll = unfinished === 0 ? true : false; 
  await ctx.redirect(currentPage);
})

// 全选
router.get('/checkall', async (ctx) => {

  checkAll = !checkAll;
  setTodoListChkAll(checkAll);
  await ctx.redirect(currentPage);
})

router.post('/delete', async (ctx) => {

  let { id } = ctx.request.body;
  let index = todoList.findIndex(item => item.id === id);
  if (index >= 0) { 
    deleteTodoRow(todoList, index)
  } 
  await ctx.redirect(currentPage);
})

router.get('/edit/:id', async (ctx) => {

  editId = ctx.params.id || '';
  await ctx.redirect(currentPage);
})

// 保存编辑，编辑提交后，title为‘’时，进行删除
router.post('/saveEdit/:id', async ctx => {

  const { id } = ctx.params;
  const { title } = ctx.request.body;
  let findIndex = todoList.findIndex(item => item.id === id);
  if (title.trim())  
    todoList[findIndex].title = title.trim();
  else 
    deleteTodoRow(todoList, findIndex);
  editId = ''
  await ctx.redirect(currentPage);
})

// 设置当前页，“/”所有todo项页或/active未完成，或/complete已完成页
app.use(async (ctx, next) => {

  let pageListUrl = ['/', '/active', '/complete'];
  pageListUrl.includes(ctx.request.url) && (currentPage = ctx.request.url)
  await next();
})

app.use(router.routes()).use(router.allowedMethods());

app.listen(3333);

function setTodoListChkAll(checked) {
  let status = checked ? 'complete' : 'active';
  unfinished = checked ? 0 : todoList.length;
  todoList.forEach(element => {
    element.status = status
  });
}
function deleteTodoRow(todoList, rowIndex) {
  todoList[rowIndex].status === 'active' && --unfinished;
  todoList.splice(rowIndex, 1);
  checkAll = todoList.length < 1 ? false : (unfinished === 0 ? true : false); 
}