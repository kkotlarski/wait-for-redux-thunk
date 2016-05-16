export const ASYNC_START = 'ASYNC_START';
export const ASYNC_END = 'ASYNC_END';

const waitMiddleware = (initFn, renderFn, finalFn) => {
    var asyncCount = 0,
        sent = false;

    return store => {
        process.nextTick(function () {
            initFn(store);
            if (!asyncCount) {
                renderFn(store);
            }

            process.nextTick(function () {
                if (asyncCount === 0 && !sent) {
                    sent = true;
                    finalFn(store, renderFn(store));
                }
            });
        });

        return next => action => {
            if (action.meta === ASYNC_START) {
                asyncCount++;
            } else if (action.meta === ASYNC_END) {
                asyncCount--;

                process.nextTick(function () {
                    if (asyncCount === 0 && !sent) {
                        renderFn(store);

                        process.nextTick(function () {
                            if (asyncCount === 0 && !sent) {
                                sent = true;
                                finalFn(store, renderFn(store));
                            }
                        });
                    }
                });
            }

            return next(action);
        }
    }
}

export default waitMiddleware;
