const Bezier = function (startPos, controlPos, endPos, allTime = 2) {

    let _this = {}
    // 曲线点集合,曲线总长,上一个点,当前时间
    let _pointLists, totalLength, prevPos, currentRunTime;

    // 运行时间
    let _runTime = allTime;
    // 起点
    let _startPos = startPos;
    // 控制点
    let _controlPos = controlPos;
    // 终点
    let _endPos = endPos;

    // 重置数据
    let resetData = function () {
        // 点集合
        _pointLists = [];
        // 线段总长度
        totalLength = currentRunTime = 0;
        // 初始位置
        prevPos = {
            x: _startPos.x,
            y: _startPos.y,
            length: 0,
        }
    }

    // ------------------------【核心代码】---------------------------
    //计算贝塞尔曲线
    let ComputeBezier = function (dt, runTime) {
        // if (currentRunTime >= runTime) {
        //     return
        // }
        // 把时间从 [0,runTime] 映射到 [0,1] 之间
        let t = currentRunTime / runTime;
        
        // 二阶贝塞尔曲线公式 (t => [0,1]) 
        var x = Math.pow(1 - t, 2) * _startPos.x
        + 2 * t * (1 - t) * _controlPos.x
        + Math.pow(t, 2) * _endPos.x;
        
        var y = Math.pow(1 - t, 2) * _startPos.y
        + 2 * t * (1 - t) * _controlPos.y
        + Math.pow(t, 2) * _endPos.y;
        
        // console.log(`x:${x},y:${y}`);
        // 计算两点距离
        let length = Math.sqrt(Math.pow(prevPos.x - x, 2) + Math.pow(prevPos.y - y, 2));
        let v2 = { x, y, length };
        // 存储当前节点
        _pointLists.push(v2);
        prevPos = v2;
        // 累计长度
        totalLength += length;
        // 累计时间
        currentRunTime += dt;
    }

    // 切割曲线
    _this.getPoints = function (count = 100) {
        resetData();
        // 分割时间
        let splitTime = _runTime / count;
        // 开始分割曲线
        for (var i = 0, len = count+1; i < len; i++) {
            ComputeBezier(splitTime, _runTime);
        }
        return _pointLists
    }

    _this.getCurveLength = function () {
        return totalLength;
    }

    return _this;
}

module.exports = Bezier;