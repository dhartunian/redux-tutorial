import { createStore, combineReducers } from 'redux'
import React from 'react';
import { Component } from 'react';
import ReactDOM from 'react-dom';

const todo = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                id: action.id,
                text: action.text,
                completed: false
            };
        case 'TOGGLE_TODO':
            if (state.id !== action.id) {
                return state;
            }
            return {
                ...state,
                completed: !state.completed
            };
        default:
            return state;
    }
};

const todos = (state = [], action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [
                ...state,
                todo(undefined, action)
            ];
        case 'TOGGLE_TODO':
            return state.map(t => todo(t, action));
        default:
            return state;
    }
};

const visibilityFilter = (
    state = 'SHOW_ALL',
    action
) => {
    switch (action.type) {
        case 'SET_VISIBILITY_FILTER':
            return action.filter;
        default:
            return state;
    }
};

/**
 * How to implement combineReducers:
 */
//const combineReducers = (reducers) => {
//    return (state = {}, action) => {
//        return Object.keys(reducers).reduce(
//            (nextState, key) => {
//                nextState[key] = reducers[key](
//                    state[key],
//                    action
//                );
//                return nextState;
//            },
//            {}
//        );
//    };
//};

/**
 * This is the essential magic of redux right here!!!!
 *
 * two state reducers COMPOSED together into a new one.
 * BOOM. And all events from before for BOTH continue
 * to work.
 *
 */
const todoApp = combineReducers({
    todos,
    visibilityFilter
});
////^--- using object shorthand from ES6

//same as:
//const todoApp = (state = {}, action) => {
//    return {
//        todos: todos(
//            state.todos,
//            action
//        ),
//        visibilityFilter: visibilityFilter(
//            state.visibilityFilter,
//            action
//        )
//    }
//};

const store = createStore(todoApp);

let nextTodoId = 0;

class TodoApp extends Component {
    render() {
        return (
            <div>
                <input ref={node => { this.input = node }} />
                <button onClick={() => {
                  store.dispatch({
                    type: 'ADD_TODO',
                    text:  this.input.value,
                    id: nextTodoId++
                  });
                  this.input.value = '';
                }}>Add Todo</button>
                <ul>
                    {this.props.todos.map(todo =>
                        <li key={todo.id}>{todo.text}</li>
                    )}
                </ul>
            </div>
        )
    }
}

const render = () => {
    ReactDOM.render(
        <TodoApp todos={store.getState().todos}/>,
        document.getElementById('app')
    )
};

store.subscribe(render);
render();

module.exports = todos;