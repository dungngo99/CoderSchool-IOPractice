const fs = require('fs')
const yargs = require('yargs')

const loadTodos = () => {
  try {
    // read the file data.json in root directory and assign it to dataBuffer
    // dataBuffer will contain binary data reading from the file
    const dataBuffer = fs.readFileSync("data.json");
    // convert binary data to string (json object)
    const dataJSON = dataBuffer.toString();
    // parsing a json object to js object so we can work with
    return JSON.parse(dataJSON);
  } catch (e) {
    // Handle error, if something goes wrong, let's just return an empty array.
    console.error(e);
    return [];
  }
}

const displayTodos = (todos) => {
  for (const todo of todos) {
    console.log(todo);
  }
}

const saveTodos = (todos) => {
  //Conver a list of todo to JSON object
  const dataJSON = JSON.stringify(todos)
  //Override the old JSON object with a new JSON object
  fs.writeFileSync('data.json', dataJSON)
}

yargs.command({
  command: 'add',
  describe: 'Add a new todo to our todo list',
  builder: {
    content: {
      describe: 'Todo content',
      demandOption: true,
      default: '',
      type: 'string'
    },
  },
  handler: function (args) {
    if (args.content === '') {
      console.log("Please add content for your todo")
      return
    }

    let todos = loadTodos()

    const id = todos.length === 0 ? 0 : todos[todos.length - 1].id + 1
    const todo = { id: id, todo: args.content, complete: false }

    todos.push(todo)
    saveTodos(todos)
    console.log("Added successfully")
  }
}).argv

yargs.command({
  command: 'list',
  descript: 'List out all todo items we have',
  builder: {
    completed: {
      describe: 'Whether a todo list is completed - Pass completed or incompleted',
      demandOption: false,
      default: null,
      type: 'string',
    }
  },
  handler: function (args) {
    let todos = loadTodos()

    if (args.completed === null) {
      displayTodos(todos)
      return;
    }

    if (args.completed !== 'completed' && args.completed !== 'incompleted'){
      console.log("Incorrect arguments!")
      return;
    }

    const completed = args.completed === 'completed' ? true : false
    const filterRes = todos.filter((e) => e.complete === completed)
    displayTodos(filterRes) 
  }
}).argv

yargs.command({
  command: 'update',
  describe: 'Update a todo content or its completion',
  builder: {
    content: {
      describe: 'A new content for a todo',
      default: null,
      demandOption: false,
      type: 'string'
    },
    id: {
      describe: "An id of a todo that need updating",
      default: null,
      demandOption: true,
      type: 'number',
    },
    completed:{
      describe: "Completion of a todo",
      default: null,
      demandOption: false,
      type: 'boolean',
    }
  },
  handler: function(args){
    let todos = loadTodos()
    let [isIn,Utodo] = [false, null]

    if (!Number.isInteger(args.id)){
      console.log("Invalid id")
      return;
    }

    for (const todo of todos){
      if (todo.id === args.id) [isIn, Utodo] = [true, todo]
    }

    if (isIn){
      if (args.completed !== null) Utodo.complete = args.completed
      if (args.content !== null) Utodo.todo = args.content
    }else{
      console.log('The todo item is not in the list')
      return;
    }

    saveTodos(todos)
    console.log('Updated successfully')
  }
}).argv

yargs.command({
  command: 'delete',
  describe: "Delete a specific todo item",
  builder: {
    id: {
      describe: 'id of a todo item that need deleting',
      commandOption: true,
      type: 'number',
    },
  },
  handler: function(args){
    let todos = loadTodos()

    if (!Number.isInteger(args.id)){
      console.log("Invalid id")
      return;
    }

    let isIn = false
    for (const todo of todos){
      if (todo.id === args.id) isIn = true
    }

    if (isIn){
      const newTodos = todos.filter((todo) => todo.id !== args.id)
      saveTodos(newTodos)
      console.log("Deleted successfully")
    }else{
      console.log('A todo is not in the list')
    }
  }
}).argv

yargs.command({
  command: 'deleteAll',
  describe: 'Delete a todo list',
  builder: {
    deleteCompleted: {
      describe: "Delete all completed todo item",
      type: 'boolean',
      default: null,
      commandOption: false,
    }
  },
  handler: function(args){
    if (args.deleteCompleted === null){
      saveTodos([])
      console.log("Deleted successfully todo list.")
    }else{
      if (args.deleteCompleted){
        const todos = loadTodos()
        const newTodos = todos.filter((todo) => todo.complete !== args.deleteCompleted)
        saveTodos(newTodos)
        console.log("Deleted successfully completed todo items.")
      }
    }
  }
}).argv