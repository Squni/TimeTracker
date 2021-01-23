const apiKey = 'ae2f2ed3-163c-4bd4-8b6f-d40f1a99f108';
const apiHost = 'https://todo-api.coderslab.pl';
const main = document.querySelector('#app');
const addBtn = document.querySelector('#addTaskBtn');


addBtn.addEventListener('click', evt => {
    evt.preventDefault();
    const title = document.querySelector('#title').value;
    const description = document.querySelector('#description').value;
    apiCreateTask(title, description);
});

function createSection(title, description, id, status) {
    const newSection = document.createElement('section');
    newSection.className = "card mt-5 shadow-sm";
    newSection.innerHTML = `<div class="card-header d-flex justify-content-between align-items-center">
            <div>
                <h5>${title}</h5>
                <h6 class="card-subtitle text-muted">${description}</h6>
            </div>
            <div>
                <button class="btn btn-dark btn-sm" id="finish">Finish</button>
                <button class="btn btn-outline-danger btn-sm ml-2" id="deleteTask">Delete</button>
            </div>
        </div>
        <ul class="list-group list-group-flush operation-list">
        </ul>
        <div class="card-body" id="newOp">
            <form>
                <div class="input-group">
                    <input type="text" placeholder="Operation description" class="form-control" minlength="5">
                    <div class="input-group-append">
                        <button class="btn btn-info" id="addOp">Add</button>
                    </div>
                </div>
            </form>
        </div>`;
    const ul = newSection.querySelector('.operation-list');
    renderOperations(id, ul, status);
    main.append(newSection);
    const fin = newSection.querySelector('#finish');
    const del = newSection.querySelector('#deleteTask');
    const add = newSection.querySelector('#addOp');
    const newOp = newSection.querySelector('#newOp');
    if (status === 'closed'){
        newOp.hidden = 'hidden';
    }
    add.addEventListener('click', evt => {
        evt.preventDefault();
        const opDesc = newSection.querySelector("input").value;
        apiAddOperation(id, opDesc, ul);
    })
    fin.addEventListener('click', e => {
        const operations = ul.querySelectorAll('li');
        for (let operation of operations) {
            for (let button of operation.querySelectorAll("button")) {
                button.remove();
            }
        }
        apiFinishTask(id, title, description);
        newOp.remove();
        fin.remove();
    });
    del.addEventListener('click', e => apiDeleteTask(id, newSection));
}

function renderOperations(id, ul, status) {
    ul.innerHTML = '';
    getOperation(id)
        .then(operationObj => {
            const operationsList = operationObj.data;
            for (let operation of operationsList) {
                const desc = operation.description;
                createOperation(id, operation, desc, ul, status);
            }
        })

}

function createOperation(id, operation, desc, element, status) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
                    <div>${desc}
                        <span class="badge badge-success badge-pill ml-2">${timeConvert(operation.timeSpent)}</span>
                    </div>
                    <div>
                        <button class="btn btn-outline-success btn-sm mr-2 opt-btn" value="15" id="min15">+15m</button>
                        <button class="btn btn-outline-success btn-sm mr-2 opt-btn" value="60" id ="min60">+1h</button>
                        <button class="btn btn-outline-danger btn-sm opt-btn" id="deleteOp">Delete</button>
                    </div>`;
    if(status === 'closed') {
        const btn = li.querySelectorAll("button");
        for (let el of btn) {
            el.hidden = 'hidden';
        }
    }
    element.append(li);
    const delOp = li.querySelector("#deleteOp");
    const min15 = li.querySelector("#min15");
    const min60 = li.querySelector("#min60");
    min15.addEventListener('click', evt => {
        const number = operation.timeSpent + 15;
        apiAddTime(id, operation.id, desc, number, element);
    });
    min60.addEventListener('click', evt => {
        const number = operation.timeSpent + 60;
        apiAddTime(id, operation.id, desc, number, element);
    });
    delOp.addEventListener('click', evt => apiDeleteOperation(operation.id, li));
}

function apiAddTime(id, opId, desc, number, element) {
    fetch(apiHost + `/api/operations/${opId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey
        },
        body: JSON.stringify({description: desc, timeSpent: number})
    }).then(e => {
        if (e.ok) {
            renderOperations(id, element);
        } else {
            alert('Couldn\'t add the operation.')
        }
    })
}

function apiListTasks() {
    return fetch(apiHost + '/api/tasks', {headers: {Authorization: apiKey}})
        .then(e => {
            if (e.ok) {
                return e.json();
            } else {
                return alert('Data fetch error. Check devtools for more details.');
            }
        })
}

function renderTask() {
    main.querySelectorAll('section').forEach(e => e.remove());
    apiListTasks().then(taskList => {
        for (let task of taskList.data) {
            createSection(task.title, task.description, task.id, task.status);
        }
    })
}

function getOperation(id) {
    return fetch(`https://todo-api.coderslab.pl/api/tasks/${id}/operations`, {headers: {Authorization: apiKey}})
        .then(e => {
            if (e.ok) {
                return e.json();
            } else {
                return alert('Data fetch error. Check devtools for more details.');
            }
        })


}

function timeConvert(opTime) {
    if (opTime > 60) {
        const newTime = Math.floor(opTime / 60);
        const moduloTime = opTime % 60;
        if (moduloTime === 0) {
            return `${newTime}h`
        } else {
            return `${newTime}h${moduloTime}min`;
        }
    } else {
        return `${opTime}min`
    }

}

function apiCreateTask(title, description) {
    fetch(apiHost + '/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey
        },
        body: JSON.stringify({title: title, description: description, status: 'open'})
    }).then(e => {
        if (e.ok) {
            renderTask();
        } else {
            alert('Couldn\'t add the task.')
        }
    })
}

function apiFinishTask(id, title, description) {
    fetch(apiHost + `/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey
        },
        body: JSON.stringify({title: title, description: description, status: 'closed'})
    }).then(e => {
        if (e.ok) {
            renderTask();
        } else {
            alert('Couldn\'t finish the task.')
        }
    })
}

function apiDeleteTask(id, element) {
    fetch(apiHost + `/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {Authorization: apiKey}
    }).then(e => {
        if (e.ok) {
            element.remove();
        } else {
            alert('Couldn\'t remove the task.');
        }
    });
}

function apiDeleteOperation(id, element) {
    fetch(apiHost + `/api/operations/${id}`, {
        method: 'DELETE',
        headers: {Authorization: apiKey}
    }).then(e => {
        if (e.ok) {
            element.remove();
        } else {
            alert('Couldn\'t remove the operation.');
        }
    });
}

function apiAddOperation(id, desc, element) {
    fetch(apiHost + `/api/tasks/${id}/operations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey
        },
        body: JSON.stringify({description: desc, timeSpent: 0})
    }).then(e => {
        if (e.ok) {
            renderOperations(id, element);
        } else {
            alert('Couldn\'t add the operation.')
        }
    })

}


renderTask();