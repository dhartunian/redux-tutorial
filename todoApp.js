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

const Link = ({active, children, onClick}) => {
    if (active) {
        return <span>{children}</span>
    }
    return (
        <a href='#'
           onClick={e => {
             e.preventDefault();
             onClick();
           }}>
            {children}
        </a>
    );
};

class FilterLink extends Component {
    componentDidMount() {
        const { store } = this.context;
        this.unsubscribe = store.subscribe(() => this.forceUpdate());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const { store } = this.context;
        const { filter, children } = this.props;
        const state = store.getState();

        return (
            <Link active={filter === state.visibilityFilter}
                  onClick={() => {
                    store.dispatch({
                      type: 'SET_VISIBILITY_FILTER',
                      filter
                    })
                  }}
            >
                {children}
            </Link>
        )
    }
}
FilterLink.contextTypes = {
    store: React.PropTypes.object
};


const getVisibleTodos = (todos,filter) => {
  switch (filter) {
      case 'SHOW_ALL':
          return todos;
      case 'SHOW_COMPLETED':
          return todos.filter(t => t.completed);
      case 'SHOW_ACTIVE':
          return todos.filter(t => !t.completed);
  }
};

const Todo = ({onClick, completed, text}) => (
    <li onClick={onClick} style={{textDecoration: completed ? 'line-through' : 'none'}}>
        {text}
    </li>
);

const TodoList = ({todos, onTodoClick}) => (
    <ul>
        {todos.map(todo =>
            <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
        )}
    </ul>
);

class VisibleTodoList extends Component {
    componentDidMount() {
        const { store } = this.context;
        this.unsubscribe = store.subscribe(() => this.forceUpdate());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const { store } = this.context;
        const state = store.getState();

        return (
            <TodoList
                todos={getVisibleTodos(state.todos, state.visibilityFilter)}
                onTodoClick={id => store.dispatch({type: 'TOGGLE_TODO', id})}
            />
        )
    }
}
VisibleTodoList.contextTypes = {
    store: React.PropTypes.object
};

const AddTodo = (props, { store }) => {
    let input;
    return (
        <div>
            <input ref={node => {input = node}}/>
            <button onClick={() => {
              store.dispatch({
                type: 'ADD_TODO',
                text: input.value,
                id: nextTodoId++
              });
              input.value = '';
            }}>
                Add Todo
            </button>
        </div>
    )
};
AddTodo.contextTypes = {
    store: React.PropTypes.object
};


const Footer = () => (
    <p>
        Show:
        {' '}
        <FilterLink filter='SHOW_ALL'>
            All
        </FilterLink>
        {' '}
        <FilterLink filter='SHOW_ACTIVE'>
            Active
        </FilterLink>
        {' '}
        <FilterLink filter='SHOW_COMPLETED'>
            Completed
        </FilterLink>
    </p>
);

let nextTodoId = 0;

const TodoApp = () => (
    <div>
        <AddTodo />
        <VisibleTodoList />
        <Footer />
    </div>
);

class Provider extends Component {
    getChildContext() {
        return {
            store: this.props.store
        }
    }

    render() {
        return this.props.children;
    }
}
Provider.childContextTypes = {
    store: React.PropTypes.object
};

ReactDOM.render(
    <Provider store={createStore(todoApp)}>
        <TodoApp/>
    </Provider>,
    document.getElementById('app')
);

module.exports = todos;