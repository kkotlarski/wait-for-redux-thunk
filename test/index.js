import {assert} from 'chai';
import sinon from 'sinon';
import waitMiddleware, {ASYNC_START, ASYNC_END} from '../src/index';

describe('wait middleware', () => {
    let storeStub, createFakeStore, initFn, renderFn;
    beforeEach(() => {
        storeStub = {
            getState() {
                return 1;
            }
        };
        createFakeStore = () => storeStub;
        initFn = sinon.spy();
        renderFn = sinon.spy(() => 'rendered');
    })

    it('should work without action calls', (done) => {
        const middleware = waitMiddleware(initFn, renderFn, (store, result) => {
            assert(initFn.calledOnce, 'initFn should be caled once');
            assert(initFn.calledWith(storeStub), 'initFn should be called with store');
            assert(initFn.calledBefore(renderFn), 'initFn should be caled before renderFn');
            assert(renderFn.alwaysCalledWith(storeStub), 'renderFn should be caled with store');
            assert.strictEqual(store, storeStub, 'finalFn should be called with store');
            assert.equal(result, 'rendered', 'finalFn should be called with result from renderFn');
            done();
        });
        middleware(createFakeStore(storeStub));
    });

    it('should work with async calls', (done) => {
        let controll = false;
        const middleware = waitMiddleware(initFn, renderFn, (store, result) => {
            assert(initFn.calledOnce, 'initFn should be caled once');
            assert(initFn.calledWith(storeStub), 'initFn should be called with store');
            assert(initFn.calledBefore(renderFn), 'initFn should be caled before renderFn');
            assert(renderFn.alwaysCalledWith(storeStub), 'renderFn should be caled with store');
            assert.strictEqual(store, storeStub, 'finalFn should be called with store');
            assert.equal(result, 'rendered', 'finalFn should be called with result from renderFn');
            assert(controll, 'finalFn should be caled after last ASYNC_END');
            done();
        });
        const dispatch = middleware(createFakeStore(storeStub))(action => action);
        dispatch({meta: ASYNC_START});
        setTimeout(() => {
            controll = true;
            dispatch({meta: ASYNC_END});
        }, 100);
    });

    it('should work with sequential async calls', (done) => {
        let controll = false;
        let callCounter = 3;
        let dispatch;
        const renderFn = sinon.spy(() => {
            if (--callCounter >= 0) {
                dispatch({meta: ASYNC_START});
                setTimeout(() => {
                    dispatch({meta: ASYNC_END});
                    if (!callCounter) {
                        controll = true;
                    }
                }, 100);
            }
            return 'rendered';
        });
        const middleware = waitMiddleware(initFn, renderFn, (store, result) => {
            assert(initFn.calledOnce, 'initFn should be caled once');
            assert(initFn.calledBefore(renderFn), 'initFn should be caled before renderFn');
            assert(initFn.calledWith(storeStub), 'initFn should be called with store');
            assert(renderFn.alwaysCalledWith(storeStub), 'renderFn should be caled with store');
            assert.strictEqual(store, storeStub, 'finalFn should be called with store');
            assert.equal(result, 'rendered', 'finalFn should be called with result from renderFn');
            assert(controll, 'finalFn should be caled after last ASYNC_END');
            done();
        });
        dispatch = middleware(createFakeStore(storeStub))(action => action);
    });

});
