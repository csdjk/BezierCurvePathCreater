var EventListener = (function () {
    let _this = {};
    var handlers = {};
    // 订阅事件
    _this.on = function (eventType, method) {
        handlers[eventType] = handlers[eventType] || []
        handlers[eventType].push(method);
    };

    // 触发事件(发布事件)
    _this.emit = function (eventType, data) {
        if (!handlers[eventType]) {
            return
        }
        for (var i = 0, len = handlers[eventType].length; i < len; i++) {
            handlers[eventType][i].call(null, data)
        }
    };

    // 删除订阅事件
    _this.off = function (eventType, method) {
        let handler = handlers[eventType];
        for (var i = 0, len = handler.length; i < len; i++) {
            if (handler[i] === method) {
                handler.splice(i, 1);
            }
        }
    }

    return _this;

}());

module.exports = EventListener;
