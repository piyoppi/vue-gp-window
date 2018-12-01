<template>
    <transition v-on:enter="enter">
        <div class="wnd-outer"
             v-show="_visible"
             v-bind:style="{
                width: this._width,
                height: this._height,
                left: this._x,
                top: this._y,
                zIndex: this.zIndex,
             }"
        >
            <div class="wnd-bg-screen" v-if="dialogMode"></div>
            <div class="wnd-caption" ref="captionBar" @mousedown.prevent="mousedown">
                {{ caption }}
                <input class="wnd-close" type="button" @click="closeButtonClicked" value="x">
            </div>
            <div class="wnd-inner" ref="wndInner" v-bind:class="{'wnd-inner-withbtn': selectButtons.length > 0 }"></div>
            <div class="wnd_button_outer" ref="buttonOuter" v-if="selectButtons.length">
                <button v-for="(item, index) in selectButtons" class="wnd-button-item" @click="buttonClicked(item)">{{ item.caption }}</button>
            </div>
            <div class="wnd-mod-size" v-if="sizeChangeEnable" @mousedown="startSizeChange"></div>
        </div>
    </transition>
</template>

<script>

export default {
    data: function () {
        return {
            _wndID: 0,
            x: null,
            y: null,
            cursorOffset: {x: 0, y: 0},
            cursorStartPos: null,
            stateAtSizeChangeStarted: {width: 0, height: 0, cursorX: 0, cursorY: 0},
            width: this.initialWidth,
            height: this.initialHeight,
        }
    },
    props: {
        visible: {
            type: Boolean,
            default: true
        },
        wndID: {
            type: Number,
            default: -1 
        },
        isVisibleControlState: {
            type: Boolean,
            default: false 
        },
        isCloseButtonDisable: {
            type: Boolean,
            default: false 
        },
        caption: {
            type: String,
            default: "" 
        },
        initialPosition: {
            type: Array,
            default: null, 
        },
        sizeChangeEnable: {
            type: Boolean,
            default: true, 
        },
        initialWidth: {
            type: Number,
            default: 0,
        },
        initialHeight: {
            type: Number,
            default: 0,
        },
        selectButtons: {
            type: Array,
            default: ()=>[],
        },
        dialogMode: {
            type: Boolean,
            default: false,
        },
        tag: {
            type: Object,
            default: null
        }
    },
    computed: {
        _visible: function(){
            if( this.$store && this.isVisibleControlState ){
                const state = this.$store.state.gpWindowStore.wndStatuses[this._wndID];
                if( state.visible && !state._isPublishedOpenEvent ) {
                    this.$emit("opened", this._wndID, this.tag);
                    this.$store.dispatch('publshedOpenEvent', {wndID: this._wndID});
                } else if( !state._isPublishedCloseEvent )  {
                    this.$emit("closed", this._wndID, this.tag);
                    this.$store.dispatch('publshedCloseEvent', {wndID: this._wndID});
                }
                return this.$store.getters.getWndVisibleByID(this._wndID);
            } else {
                if( this.visible ){
                    if( !this.$store.state.wndStatuses[this._wndID].visible ) this.$emit("opened", this._wndID, this.tag);
                } else {
                    if( this.$store.state.wndStatuses[this._wndID].visible ) this.$emit("closed", this._wndID, this.tag);
                }
                this.$store.dispatch('setWndStatuses', {wndID: this._wndID, visible: this.visible});
                return this.visible;
            }
        },
        _width: function() {
            return this.width ? `${this.width}px` : 'auto';
        },
        _height: function() {
            return this.height ? `${this.height}px` : 'auto';
        },
        _x: function() {
            return `${this.x}px`;
        },
        _y: function() {
            return `${this.y}px`;
        },
        zIndex: function() {
            if( this.$store ) {
                return this.$store.state.gpWindowStore.wndStatuses[this._wndID].zIndex || 0;
            } else {
                return 0;
            }
        }
    },
    created: function(){
        if( this.$store ) {
            this._wndID = this.wndID < 0 ? this.$store.state.gpWindowStore.wndCount : this.wndID;
            this.$store.dispatch('setWndStatuses', {wndID: this._wndID, tag: this.tag, visible: this.visible});
        }
    },
    mounted: function(){
        this.$emit('require-inner-item', el => {
            this.$refs.wndInner.appendChild(el);
            //（v-show=falseの時は要素の高さが取れないので初期化しない）
            if( this._visible && this.$el ){
                this.setInitialState();
            }
        });
    },
    methods: {

        //
        //  Initialize
        //

        enter: function() {
            this.setInitialState();
        },
        setInitialState: function() {
            //v-ifなどで要素自体が取れない場合は処理を中断
            if( !this.$el || !this.$refs.wndInner ) return;
            let buttonItemRect = null;
            if( this.selectButtons.length ) {
                buttonItemRect = this.$refs.buttonOuter.getBoundingClientRect();
            }

            //最前面にする
            this.moveWindowToTop();

            //大きさを設定する
            let innerItemRect = this.$refs.wndInner.getBoundingClientRect();
            let captionBarRect = this.$refs.captionBar.getBoundingClientRect();
            this.width = this.initialWidth || innerItemRect.width;
            this.height = (this.initialHeight || innerItemRect.height) + captionBarRect.height + ((this.selectButtons.length && buttonItemRect) ? buttonItemRect.height : 0);

            this.$emit("show", this._wndID, this.$store ? this.$store.state.gpWindowStore.wndStatuses[this._wndID] : null);

            //初期化が済んでいれば処理を終了
            if( (this.x !== null) && (this.y !== null) ) return;
            if( this.initialPosition && this.initialPosition.length === 2 ){
                this.x = this.initialPosition[0];
                this.y = this.initialPosition[1];
            } else {
                this.x = (window.innerWidth / 2) - (this.$el.clientWidth / 2);
                this.y = (window.innerHeight / 2) - (this.$el.clientHeight / 2);
            }
        },

        //
        //  Windows Z-Index
        //

        moveWindowToTop: function() {
            if( this.$store ) this.$store.dispatch('moveWndToTop', {wndID: this._wndID});
        },

        //
        //  Change position
        //

        mousedown: function(e) {
            this.cursorOffset.x = e.pageX;
            this.cursorOffset.y = e.pageY;
            this.cursorStartPos = {x: this.x, y: this.y};
            document.addEventListener("mousemove", this.mousemove)
            document.addEventListener("mouseup", this.mouseup)
            this.$emit("start-move", this._wndID, this.$store ? this.$store.state.gpWindowStore.wndStatuses[this._wndID] : null);
            this.moveWindowToTop();
        },
        mousemove: function(e) {
            this.x = this.cursorStartPos.x + (e.pageX - this.cursorOffset.x);
            this.y = this.cursorStartPos.y + (e.pageY - this.cursorOffset.y);
        },
        mouseup: function(e) {
            this.cursorStartPos = null;
            document.removeEventListener("mousemove", this.mousemove)
            document.removeEventListener("mouseup", this.mouseup)
            this.$emit("end-move", this._wndID, this.$store ? this.$store.state.gpWindowStore.wndStatuses[this._wndID] : null);
        },

        //
        //  Resize window
        //

        startSizeChange: function(e) {
            let wndRect = this.$el.getBoundingClientRect()
            this.stateAtSizeChangeStarted = {
                width: wndRect.width,
                height: wndRect.height,
                cursorX: e.pageX,
                cursorY: e.pageY
            };
            document.addEventListener('mousemove', this.whileSizeChange, false);   
            document.addEventListener('mouseup', this.endSizeChange, false);   
            this.$emit("start-resize");
        },
        whileSizeChange: function(e) {
            this.width = this.stateAtSizeChangeStarted.width + e.pageX - this.stateAtSizeChangeStarted.cursorX
            this.height = this.stateAtSizeChangeStarted.height + e.pageY - this.stateAtSizeChangeStarted.cursorY
        },
        endSizeChange: function(e) {
            document.removeEventListener('mousemove', this.whileSizeChange, false);   
            document.removeEventListener('mouseup', this.endSizeChange, false);   
            this.$emit("end-resize");
        },

        //
        //  Buttons
        //

        buttonClicked: function(item){
            this.$emit('button-clicked', item);
        },
        closeButtonClicked: function() {
            if( !this.isCloseButtonDisable ) {
                if( this.$store && this.isVisibleControlState ){
                    this.$store.dispatch('setWndStatuses', {wndID: this._wndID, visible: false});
                } else {
                    this.$emit('update:visible', false)
                }
            }
            this.$emit('close-button-clicked', this._wndID);
        },
    },
}

</script>

<style scoped>
.wnd-outer {
    position: fixed;
    width: 100%;
    height: 100%;
    border: solid 1px black;
    border-radius: 5px 5px 0 0;
    background-color: #555;
    z-index: 1000;
}
.wnd-caption {
    width: 100%;
    height: 22px;
    background-color: #333;
    padding: 0;
    box-sizing: border-box;
    color: white;
    font-size: 9pt;
    padding: 4px 0 4px 10px;
    position: relative;
}
.wnd-close {
    background-color: transparent;
    color: white;
    border-style: solid;
    border-color: white;
    border-width: 0 0 0 1px;
    cursor: pointer;
    position: absolute;
    bottom: 3px;
    right: 0px;
}
.wnd-mod-size {
    position: absolute;
    bottom: 0px;
    right: 0px;
    width: 10px;
    height: 10px;
    background-color: red;
}
.wnd-inner {
    width: 100%;
    height: calc( 100% - 22px );
    position: relative;
}
.wnd-inner-withbtn {
    height: calc( 100% - 67px );
}
.wnd_button_outer {
    position: absolute;
    width: 100%;
    height: 45px;
    text-align: center;
}
.wnd-button-item {
    height: 30px;
    min-width: 90px;
    padding: 5px 15px;
    margin-top: 9px;
    margin-left: 5px;
    border-style: solid;
    border-color: black;
    border-width: 1px 3px 3px 1px;
    border-radius: 3px;
    background-color: #333;
    color: white;
    cursor: pointer;
    position: relative;
    box-sizing: border-box;
    display: inline-block;
    vertical-align: top;
}
.wnd-button-item:active{
    border-width: 1px;
    top: 2px;
    left: 2px;
}
.wnd-bg-screen {
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
}
</style>
