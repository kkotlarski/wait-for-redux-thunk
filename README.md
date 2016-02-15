# wait-for-redux-thunk

Simple middleware providing hooks after every async action and a final callback when all async actions are completed. Very useful when building universal react applications with [redux-thunk](https://github.com/gaearon/redux-thunk).


### Installation

To install the stable version:

```
npm install --save wait-for-redux-thunk
```

Use ASYNC_START and ASYNC_END to mark async actions

```js
import { ASYNC_START, ASYNC_END } from 'wait-for-redux-thunk';

function asyncActionStart(options) {
	return {
		type: ASYNC_REQUEST,
        payload: options,
		meta: ASYNC_START
	};
}

function asyncActionSuccess(data) {
	return {
		type: ASYNC_SUCCESS,
		payload: data,
		meta: ASYNC_END
	};
}

function asyncActionError(error) {
	return {
		type: ASYNC_ERROR,
		payload: error,
		meta: ASYNC_END
	};
}
```



```js
import waitMiddleware from 'wait-for-redux-thunk';
import thunkMiddleware from 'redux-thunk';
import {createStore, applyMiddleware} from 'redux';
import {renderToString} from 'react-dom/server';
import reducers from './reducers';
import ReactApp from './reactApp';

// called before first render
const initFn = (store) => {};

// called when each async action is completed,
// should return string representing React application
const renderFn = (store) => renderToString(<ReactApp store={store} />);

// called when all async actions are completed,
// provides the latest state and render string
const finalFn = (store, content) => {
    const state = store.getState();

    res.render('index.html', {content, state: JSON.stringify(state)});
};

const createMidlewareStore = applyMiddleware(
    thunkMiddleware,
    waitMiddleware(initFn, renderFn, finalFn)
)(createStore);
const store = createMidlewareStore(reducers);
```

### License

MIT
