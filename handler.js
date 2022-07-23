let obj =  {
  unfinished: 0,
  checkAll: false,
  todoList:[],
  editId: ''
}
class Handler {
  static TodoModel = obj;
  static support = ['add', 'delete', 'checkAll', 'changeActive', 'clearComplete', 'edit', 'saveEdit']
  static addTodo(data) {
    this.changeTodoList('add', data)
  }

  static handleEdit(id) {
    this.TodoModel.editId = id
  }
  /**
   * 
   * @param {*} type 类型， ‘delete’, 'add', 'changeActive', 'checkAll' 等
   * @param {*} params 
   */
  static changeTodoList(type, params = {}) {
    const { id = '', title = '' } = params;
    let index = this.TodoModel.todoList.findIndex(item => item.id === id)

    switch (type) {
      case 'save':
        if(!title.trim()) break;
        let data = { id: Math.random().toString(36).slice(6), title: title.trim(), completed: false }
        this.TodoModel.todoList.push(data)
        break;
    
      case 'delete':
        index >= 0 && this.TodoModel.todoList.splice(index, 1)
        break;

      case 'checkAll':
        this.TodoModel.checkAll = !this.TodoModel.checkAll
        this.TodoModel.todoList.forEach(item => item.completed = this.TodoModel.checkAll  )
        break;

      case 'changeActive':
        this.TodoModel.todoList[index].completed = !this.TodoModel.todoList[index].completed
        break;
      case 'clearComplete':
        this.TodoModel.todoList = this.TodoModel.todoList.filter(item => !item.completed)
        break;
      case 'edit':
        this.TodoModel.editId = id
        break;
      case 'saveEdit':
        if(title.trim()) {
          this.TodoModel.todoList[index].title = title;
          this.TodoModel.editId = ''
        }else this.changeTodoList('delete', {id})
      default:
        break;
    }
    this.TodoModel.unfinished = this.TodoModel.todoList.filter(i => !i.completed).length
    this.TodoModel.checkAll = this.TodoModel.unfinished > 0 ? false : (this.TodoModel.todoList.length > 0? true : false)
  }
}


module.exports = Handler