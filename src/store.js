import Vue from "vue"
export default {
    state: {
        wndStatuses: {},
        wndCount: 0,
        maxWndZIndex: 0,
        topWndID: -1,
    },
    mutations: {
        setWndStatuses: (state, payload) => {
            if( !state.wndStatuses[payload.wndID] ) {
                Vue.set(state.wndStatuses, payload.wndID, {
                    zIndex: state.wndCount,
                    tag: payload.tag || null
                });
                state.maxWndZIndex = state.wndCount;
                state.wndCount = state.wndCount+1;
                state.topWndID = payload.wndID;
            }
        },
        moveWndToTop: (state, payload) => {
            let oldZIndex = state.wndStatuses[payload.wndID].zIndex;
            state.wndStatuses[payload.wndID].zIndex = state.maxWndZIndex;
            state.topWndID = payload.wndID;
            for(let key in state.wndStatuses){
                if( (state.wndStatuses[key].zIndex > oldZIndex) && (key != payload.wndID) ) {
                    state.wndStatuses[key].zIndex -= 1;
                }
            }
        },
    },
    actions: {
        setWndStatuses(context, payload) {
            context.commit('setWndStatuses', payload);
        },
        moveWndToTop(context, payload) {
            context.commit('moveWndToTop', payload);
        }
    }
};
