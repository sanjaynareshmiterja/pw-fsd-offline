// Task
class Task {
    constructor(id, desc = "No Description", isCompleted = false) {
        this.id = id;
        this.desc = desc;
        this.isCompleted = isCompleted;
    }
}

// TaskManager
class TaskManager {

    constructor() {
        this.tasks = this.readFromLocalStorage();
    }

    // add to the task
    createTask(description) {
        const id = "t_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        const task = new Task(id, description);
        this.tasks.push(task);
        this.saveToLocalStorage();
    }

    // delete a task
    deleteTask(id) {
        this.tasks = this.tasks.filter(eTask => eTask.id !== id);
        this.saveToLocalStorage();
    }

    // updateStatus of the task
    toggleStatus(id) {
        console.log(id);
        const task = this.tasks.find(eTask => eTask.id === id);
        console.log(task);
        if(task) {
            task.isCompleted = !task.isCompleted;
            this.saveToLocalStorage();
        }
    }

    // edit the task
    editTask(id, newDesc) {
        const task = this.tasks.find(eTask => eTask.id === id);
        if(task && newDesc?.length > 3) {
            task.desc = newDesc;
            this.saveToLocalStorage();
        }
    }

    // store to local storage
    saveToLocalStorage() {
        localStorage.setItem('mytasks', JSON.stringify(this.tasks));
    }

    // read from the local storage
    readFromLocalStorage() {
        return JSON.parse(localStorage.getItem('mytasks')) || [];
    }

    // filter tasks based on all || completed || pending
    filterTasks(status) {
        if(status === "pending")
            return this.tasks.filter(eTask => eTask.isCompleted === false);
        if(status === "completed")
            return this.tasks.filter(eTask => eTask.isCompleted === true);
        
        return this.tasks;
    }
}

// UiHandler

class UiHandler {
    constructor(taskManager) {
        console.log("In constructor!");
        this.taskManager = taskManager;
        this.taskInput = document.getElementById('task-input');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.taskList = document.getElementById('task-list');

        this.filterOn = "all";
        this.addBaseEventListeners();

        this.renderTasks();
    }


    addBaseEventListeners() {
        // add the task on addBtn click
        console.log("Base event listeners added!");
        document.getElementById('add-btn')
        .addEventListener('click', () => {
            this.addTask();
        });


        // add the task on enter key press
        this.taskInput.addEventListener('keypress', (e) => {
            if(e.key === "Enter") {
                this.addTask();
            }
        });

        // add the event listener for filter btns
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // update the global check all || pending || complted
                this.filterOn = btn.dataset.filter;

                // update the ui for active
                this.updateFilterButton();

                // re-render the tasks
                this.renderTasks();
            });
        });
    }

    updateFilterButton() {
        this.filterBtns.forEach(btn => btn.classList.remove("active"));

        document.querySelector(`[data-filter="${this.filterOn}"]`).classList.add('active');
    }

    addTask() {
        const taskDesc = this.taskInput.value.trim();

        if(!taskDesc || taskDesc.length < 3)
            return alert("Please enter a valid task!");
        
        this.taskManager.createTask(taskDesc);
        this.taskInput.value = "";

        // render tasks
        this.renderTasks();
    }

    renderTasks() {
        this.taskList.innerHTML = "";

        const tasks = this.taskManager.filterTasks(this.filterOn);

        console.log(tasks);

        tasks.forEach(eTask => {
            let li = document.createElement('li');
            console.log(eTask);
            li.className = `task-item ${eTask.isCompleted ? "completed" : ""}`;

            li.innerHTML = `
                <div class="task-left">
                    <input class="check" type="checkbox" ${eTask.isCompleted ? "checked" : ""} data-id="${eTask.id}">
                    <span>${eTask.desc}</span>
                </div>
                <div>
                    <button class="btn edit" data-id="${eTask.id}">Edit</button>
                    <button class="btn delete" data-id="${eTask.id}">Delete</button>
                </div>
            `

            this.taskList.appendChild(li);
        });

        // check this
        this.dynamicEventListners();
    }

    dynamicEventListners() {
        document.querySelectorAll('.check').forEach(eCheckBox => {
            console.log(eCheckBox);
            eCheckBox.addEventListener('change', (e) => {
                console.log("Toogle event called!");
                this.taskManager.toggleStatus(e.target.dataset.id);
                this.renderTasks();
            });
        });

        document.querySelectorAll('.delete').forEach(eDeleteBtn => {
            eDeleteBtn.addEventListener('click', (e) => {
                this.taskManager.deleteTask(e.target.dataset.id);
                this.renderTasks();
            });
        });

        document.querySelectorAll('.edit').forEach(eEditBtn => {
            eEditBtn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                let newDesc = prompt("Edit Task:");

                if(newDesc) {
                    this.taskManager.editTask(id, newDesc);
                    this.renderTasks();
                }
            });
        });
    }
}

let myTaskManager = new TaskManager();
new UiHandler(myTaskManager);