"use strict";

/**
 * @class Model
 *
 * Manages the data of the application
 */
class Model {
    constructor() {
        this.todos = [
            { id: 1, text: "Run a marathon", completed: true },
            { id: 2, text: "Plant a garden", completed: false },
        ];

        this.todos = JSON.parse(localStorage.getItem("todos")) || this.todos;
    }

    bindTodoListChanged(cb) {
        this.onTodoListChanged = cb;
    }

    _commit(todos) {
        this.onTodoListChanged(todos);
        localStorage.setItem("todos", JSON.stringify(todos));
    }

    addTodo(todoText) {
        const todo = {
            id:
                this.todos.length > 0
                    ? this.todos[this.todos.length - 1].id + 1
                    : 1,
            text: todoText,
            complete: false,
        };

        this.todos.push(todo);

        this._commit(this.todos);
    }

    editTodo(id, updatedText) {
        this.todos.forEach((todo) => {
            if (todo.id === id) {
                todo.text = updatedText;
            }
        });
        console.log("001", this.todos);
        this._commit(this.todos);
    }

    deleteTodo(id) {
        this.todos = this.todos.filter((todo) => todo.id !== id);

        this._commit(this.todos);
    }

    toggleTodo(id) {
        console.log(id);
        this.todos = this.todos.map((todo) => {
            if (todo.id === id) {
                todo.completed = !todo.completed;
            }
            return todo;
        });
        this._commit(this.todos);
    }
}

class View {
    constructor() {
        this.app = this.getElement("#root");
        this.app.classList.add("container");

        this.title = this.createElement("h1", "title");
        this.title.textContent = "Todos";

        this.form = this.createElement("form", "form");

        this.input = this.createElement("input", "form__text");
        this.input.type = "text";
        this.input.placeholder = "Add todo";
        this.input.name = "todo";

        this.submitButton = this.createElement(
            "button",
            "button",
            "form__button"
        );
        this.submitButton.textContent = "Submit";
        this.submitButton.type = "submit";

        this.todoList = this.createElement("ul", "todo-list");

        this.form.append(this.input, this.submitButton);
        this.app.append(this.title, this.form, this.todoList);

        this._temporaryTodoText;
        this._initLocalListeners();
    }

    _initLocalListeners() {
        this.todoList.addEventListener("input", (event) => {
            if (event.target.classList.contains("todo-list__name")) {
                this._temporaryTodoText = event.target.innerText;
            }
        });
    }

    createElement(tag, ...classNames) {
        const element = document.createElement(tag);
        if (classNames) {
            classNames.forEach((className) => {
                element.classList.add(className);
            });
        }
        return element;
    }

    getElement(selector, parent = document) {
        return parent.querySelector(selector);
    }

    displayTodos(todos) {
        // Delete all nodes
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild);
        }

        if (todos.length === 0) {
            const p = this.createElement("p");
            p.textContent = "Nothing to do! Add a task?";
            this.form.append(p);
        } else {
            todos.forEach((todo) => {
                const task = this.createElement("li", "todo-list__item");
                console.log("002", todo);
                task.id = todo.id;

                const checkbox = this.createElement(
                    "input",
                    "todo-list__checkbox"
                );
                checkbox.type = "checkbox";
                checkbox.checked = todo.complete;

                const name = this.createElement("span", "todo-list__name");
                name.contentEditable = true;
                if (todo.completed) {
                    const strike = this.createElement("s");
                    strike.textContent = todo.text;
                    name.append(strike);
                } else {
                    name.textContent = todo.text;
                }

                const deleteButton = this.createElement(
                    "button",
                    "todo-list__button",
                    "button",
                    "button--delete"
                );
                deleteButton.textContent = "Delete";
                task.append(checkbox, name, deleteButton);
                this.todoList.append(task);
            });
        }
    }

    bindAddTodo(handler) {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();

            if (this._todoText) {
                handler(this._todoText);
                this._resetInput();
            }
        });
    }

    bindDeleteTodo(handler) {
        this.todoList.addEventListener("click", (event) => {
            if (event.target.classList.contains("todo-list__button")) {
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        });
    }

    bindToggleTodo(handler) {
        this.todoList.addEventListener("change", (event) => {
            if (event.target.classList.contains("todo-list__checkbox")) {
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        });
    }

    bindEditTodo(handler) {
        this.todoList.addEventListener("focusout", (event) => {
            if (this._temporaryTodoText) {
                const id = parseInt(event.target.parentElement.id);

                handler(id, this._temporaryTodoText);
                this._temporaryTodoText = "";
            }
        });
    }

    get _todoText() {
        return this.input.value;
    }

    _resetInput() {
        this.input.value = "";
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.model.bindTodoListChanged(this.onTodoListChanged);
        this.view.bindAddTodo(this.handleAddTodo);
        this.view.bindDeleteTodo(this.handleDeleteTodo);
        this.view.bindToggleTodo(this.handleToggleTodo);
        this.view.bindEditTodo(this.handleEditTodo);

        this.onTodoListChanged(this.model.todos);
    }

    onTodoListChanged = (todos) => {
        this.view.displayTodos(todos);
    };

    handleAddTodo = (todoText) => {
        this.model.addTodo(todoText);
    };

    handleDeleteTodo = (id) => {
        this.model.deleteTodo(id);
    };

    handleEditTodo = (id, todoText) => {
        this.model.editTodo(id, todoText);
    };

    handleToggleTodo = (id) => {
        this.model.toggleTodo(id);
    };
}

const app = new Controller(new Model(), new View());

export { app };
