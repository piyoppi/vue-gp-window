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
                let addObject = {};

                Vue.set(state.wndStatuses, payload.wndID, {
                    zIndex: state.wndCount,
                    tag: payload.tag || null,
                    visible: payload.visible || false,
                    _isPublishedCloseEvent: false,
                    _isPublishedOpenEvent: false,
                });
                
                state.maxWndZIndex = state.wndCount;
                state.wndCount = state.wndCount+1;
                state.topWndID = payload.wndID;
            } else {
                let wndStatus = state.wndStatuses[payload.wndID];
                if(payload.zIndex) wndStatus.zIndex = payload.zIndex;
                if(payload.tag) wndStatus.tag = payload.tag;
                if(typeof payload._isPublishedOpenEvent !== "undefined") wndStatus._isPublishedOpenEvent = payload._isPublishedOpenEvent;
                if(typeof payload._isPublishedCloseEvent !== "undefined") wndStatus._isPublishedCloseEvent = payload._isPublishedCloseEvent;

                if(typeof payload.visible !== "undefined") {
                    if( wndStatus.visible !== payload.visible ) {
                        if( payload.visible ) {
                            wndStatus._isPublishedOpenEvent = false;
                        } else {
                            wndStatus._isPublishedCloseEvent = false;
                        }
                    }
                    wndStatus.visible = payload.visible;
                }
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
        },
        publshedOpenEvent(context, payload) {
            context.commit('setWndStatuses', {wndID: payload.wndID, _isPublishedOpenEvent: true});
        },
        publshedCloseEvent(context, payload) {
            context.commit('setWndStatuses', {wndID: payload.wndID, _isPublishedCloseEvent: true});
        }
    },
    getters: {
        getWndVisibleByID: state => id => state.wndStatuses[id].visible
    }
};
