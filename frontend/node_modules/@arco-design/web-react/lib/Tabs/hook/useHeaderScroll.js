"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var dom_1 = require("../../_util/dom");
function useHeaderScroll(props) {
    var headerWrapperRef = props.headerWrapperRef, headerOffset = props.headerOffset, align = props.align, isScrollable = props.isScrollable, direction = props.direction, onScroll = props.onScroll, onScrollStart = props.onScrollStart, onScrollEnd = props.onScrollEnd;
    var headerOffsetRef = (0, react_1.useRef)(headerOffset);
    headerOffsetRef.current = headerOffset;
    var rafIdRef = (0, react_1.useRef)(null);
    var endTimerRef = (0, react_1.useRef)(null);
    var scrollingRef = (0, react_1.useRef)(false);
    var pendingOffsetRef = (0, react_1.useRef)(null);
    var scheduleScrollEnd = function () {
        if (endTimerRef.current != null) {
            window.clearTimeout(endTimerRef.current);
        }
        endTimerRef.current = window.setTimeout(function () {
            scrollingRef.current = false;
            if (onScrollEnd)
                onScrollEnd();
            endTimerRef.current = null;
        }, 80);
    };
    function scheduleOffset(offsetX, offsetY) {
        if (!isScrollable)
            return;
        pendingOffsetRef.current = { x: offsetX, y: offsetY };
        if (!scrollingRef.current) {
            scrollingRef.current = true;
            if (onScrollStart)
                onScrollStart();
        }
        if (rafIdRef.current == null) {
            rafIdRef.current = window.requestAnimationFrame(function () {
                rafIdRef.current = null;
                var pending = pendingOffsetRef.current;
                if (pending) {
                    var offset = 0;
                    if (direction === 'vertical') {
                        offset = headerOffsetRef.current + pending.y;
                    }
                    else {
                        offset =
                            align === 'left'
                                ? headerOffsetRef.current + pending.x
                                : headerOffsetRef.current - pending.x;
                    }
                    if (onScroll)
                        onScroll(offset);
                    pendingOffsetRef.current = null;
                }
                scheduleScrollEnd();
            });
        }
        else {
            scheduleScrollEnd();
        }
    }
    function onOffset(offsetX, offsetY) {
        scheduleOffset(offsetX, offsetY);
    }
    // wheel
    var lastWheelDirectionRef = (0, react_1.useRef)('x');
    function onWheel(e) {
        if (!isScrollable)
            return;
        e.preventDefault();
        var deltaX = e.deltaX, deltaY = e.deltaY;
        var offset = 0;
        var absX = Math.abs(deltaX);
        var absY = Math.abs(deltaY);
        if (absX === absY) {
            offset = lastWheelDirectionRef.current === 'x' ? deltaX : deltaY;
        }
        else if (absX > absY) {
            offset = deltaX;
            lastWheelDirectionRef.current = 'x';
        }
        else {
            offset = deltaY;
            lastWheelDirectionRef.current = 'y';
        }
        onOffset(offset, offset);
    }
    // touch
    var positionRef = (0, react_1.useRef)({
        clientX: 0,
        clientY: 0,
    });
    var getPosition = function (e) {
        return e && e.touches && e.touches.length && e.touches[0];
    };
    var onTouchMove = function (e) {
        if (e.cancelable)
            e.preventDefault();
        var position = getPosition(e);
        if (!position)
            return;
        var _a = positionRef.current, clientX = _a.clientX, clientY = _a.clientY;
        // 往右移动的距离
        var offsetX = position.clientX - clientX;
        // 往下移动的距离
        var offsetY = position.clientY - clientY;
        onOffset(-offsetX, -offsetY);
    };
    var onTouchMoveEnd = function () {
        (0, dom_1.off)(document.documentElement, 'touchmove', onTouchMove);
        (0, dom_1.off)(window, 'touchend', onTouchMoveEnd);
        scheduleScrollEnd();
    };
    var onTouchStart = function (e) {
        if (!isScrollable)
            return;
        var position = getPosition(e);
        if (!position)
            return;
        positionRef.current = {
            clientX: position.clientX,
            clientY: position.clientY,
        };
        (0, dom_1.on)(document.documentElement, 'touchmove', onTouchMove, { passive: false });
        (0, dom_1.on)(window, 'touchend', onTouchMoveEnd, { passive: false });
        if (!scrollingRef.current) {
            scrollingRef.current = true;
            if (onScrollStart)
                onScrollStart();
        }
    };
    var eventProxy = (0, react_1.useRef)(null);
    eventProxy.current = { onWheel: onWheel, onTouchStart: onTouchStart };
    (0, react_1.useEffect)(function () {
        var node = headerWrapperRef.current;
        if (!node)
            return;
        var wheelListener = function (e) {
            eventProxy.current.onWheel(e);
        };
        var touchStartListener = function (e) {
            eventProxy.current.onTouchStart(e);
        };
        (0, dom_1.on)(node, 'wheel', wheelListener, { passive: false });
        (0, dom_1.on)(node, 'touchstart', touchStartListener, { passive: true });
        return function () {
            (0, dom_1.off)(node, 'wheel', wheelListener);
            (0, dom_1.off)(node, 'touchstart', touchStartListener);
            (0, dom_1.off)(document.documentElement, 'touchmove', onTouchMove);
            (0, dom_1.off)(window, 'touchend', onTouchMoveEnd);
            if (rafIdRef.current != null) {
                window.cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            if (endTimerRef.current != null) {
                window.clearTimeout(endTimerRef.current);
                endTimerRef.current = null;
            }
            pendingOffsetRef.current = null;
            scrollingRef.current = false;
        };
    }, [headerWrapperRef.current, isScrollable]);
}
exports.default = useHeaderScroll;
