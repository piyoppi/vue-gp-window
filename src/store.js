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
                    tag: payload.tag || null,
                    visible: payload.visible || false,
                });
                state.maxWndZIndex = state.wndCount;
                state.wndCount = state.wndCount+1;
                state.topWndID = payload.wndID;
            } else {
                if(payload.zIndex) state.wndStatuses[payload.wndID].zIndex = payload.zIndex;
                if(payload.tag) state.wndStatuses[payload.wndID].tag = payload.tag;
                if(typeof payload.visible !== "undefined") state.wndStatuses[payload.wndID].visible = payload.visible;
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
        }
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
