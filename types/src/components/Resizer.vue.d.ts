import Vue from 'vue';
import { IControlStyle } from '../interfaces';
declare const _default: import("vue/types/vue").ExtendedVue<Vue, {
    prefixCls: string;
    resizerHalfSize: number;
}, {
    /** 处理 Resizer mousedown 事件 */
    handleResizerMouseDown(event: MouseEvent, direction: string): void;
}, unknown, {
    controlStyle: IControlStyle;
    showResizers: boolean;
    canvasScale: number;
    canvasPadding: number;
}>;
export default _default;
