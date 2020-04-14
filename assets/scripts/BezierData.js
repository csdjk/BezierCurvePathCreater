let Bezier = require("Bezier")

let BezierData = (function () {
    let _this = {};

    // ------------------------【私有属性】---------------------------
    // point预制体
    let pointPrefab = null;
    let controlPrefab = null;

    // 贝塞尔曲线列表
    let bezierCurveLists = [];
    // 曲线点列表
    let bezierCurveData = {
        time: 2,//运行总时长
        length: 0,//曲线总长
        points: [],//曲线点列表
    }
    // // 点 - 曲线 字典
    let pointCurveDict = new Map();
    // 需要删除的目标节点
    let deleteTarget = null;
    // 点计数
    let PointNum = 0;
    // 父节点
    let pointParent = null;
    // 曲线类型
    let currentBezierType = 2;
    // 每段曲线的切割份数
    let pointCount = 100;

    // 画板分辨率
    let resolution = {
        width: 1280,
        height: 720
    }


    // ------------------------【公有方法】---------------------------


    // 初始化
    _this.init = function (point, control, parent) {
        this.clearAllBezier()
        pointPrefab = point;
        controlPrefab = control;
        pointParent = parent;
        initRandCurve();
    }
    // 获取分辨率
    _this.getResolution = function (params) {
        return resolution;
    }
    // 设置分辨率
    _this.setResolution = function (width, height) {
        resolution = { width, height };
        return resolution;
    }

    // 设置曲线切割份数
    _this.setPointCount = function (num) {
        pointCount = num;
    }
    // 设置曲线类型
    _this.setBezierCurveType = function (type) {
        currentBezierType = type;
    }
    // 设置删除的目标节点
    _this.setDeleteTarget = function (node) {
        deleteTarget = node;
    }
    // 添加贝塞尔曲线到列表
    _this.addBezierCurve = function (curve) {
        bezierCurveLists.push(curve);
        console.log("bezierCurveLists", bezierCurveLists);
    }

    // 获取曲线类型
    _this.getBezierCurveType = function () {
        return currentBezierType;
    }
    // 获取贝塞尔曲线列表
    _this.getBezierCurveLists = function () {
        return bezierCurveLists;
    }

    // 获取贝塞尔曲线数据
    _this.getBezierCurveData = function () {
        return bezierCurveData;
    }


    // 设置贝塞尔曲线运行时长
    _this.setBezierCurveRunTime = function (time) {
        bezierCurveData.time = time;
    }
    // 是否是最后一个曲线
    _this.isLastCurve = function () {
        return bezierCurveLists.length <= 1;
    }


    // 创建二阶贝塞尔曲线
    _this.createCurve = function (pos) {
        let end = createPoint(lcl.Ident.point, pos);
        let control = createPoint(lcl.Ident.control, pos);
        // 把曲线列表最后一个点作为新曲线起点
        let start = bezierCurveLists[bezierCurveLists.length - 1].end;
        let curve = { start, control, end }
        bezierCurveLists.push(curve);
        this.saveToPointCurveDict(curve);
        console.log("bezierLists->", bezierCurveLists)
    }

    // 创建三阶贝塞尔曲线
    _this.createThirdOrderCurve = function (pos) {
        // 把曲线列表最后一个点作为新曲线起点
        let start = bezierCurveLists[bezierCurveLists.length - 1].end;
        let end = createPoint(lcl.Ident.point, pos);
        let control2 = createPoint(lcl.Ident.control, pos);
        //计算偏移点
        let c1pos = cc.v2(200, 200).add(start.position);
        c1pos.x = Math.min(resolution.width/2, c1pos.x);
        c1pos.y = Math.min(resolution.height/2, c1pos.y);
        let control1 = createPoint(lcl.Ident.control, c1pos, false);

        let curve = { start, control1, control2, end }
        bezierCurveLists.push(curve);
        this.saveToPointCurveDict(curve);
        console.log("bezierLists->", bezierCurveLists)
    }

    // 存储到曲线字典
    // key - 点, value - 该点所关联的曲线对象Obj, 
    // 曲线对象Obj: start字段 为 该点作为起点所在的曲线,  control end类似
    _this.saveToPointCurveDict = function (curve) {
        let obj;
        for (const key in curve) {
            const point = curve[key];
            if (pointCurveDict.has(point)) {
                obj = pointCurveDict.get(point);
            } else {
                obj = {};
            }
            obj[key + "Curve"] = curve;
            pointCurveDict.set(point, obj);
        }
        console.log("pointCurveDict", pointCurveDict);
    }

    // 删除节点
    _this.deletePoint = function () {
        if (pointCurveDict.has(deleteTarget)) {
            let location = getPointLocation(deleteTarget)
            if (location == "center") {
                deleteCenterPoint(deleteTarget);
            } else if (location == "start") {
                deleteStartPoint(deleteTarget);
            } else if (location == "end") {
                deleteEndPoint(deleteTarget);
            }
        }
    }

    // 保存路径
    _this.saveBezierPath = function () {
        bezierCurveData.length = 0;
        bezierCurveData.points = [];
        console.log("保存路径bezierLists", bezierCurveLists);
        for (var i = 0, len = bezierCurveLists.length; i < len; i++) {
            const bezier = bezierCurveLists[i];
            // 创建一个贝塞尔曲线
            // let bezierCurve = new Bezier(bezier.start, bezier.control, bezier.end, 100);
            // console.log("consscscds", Object.values(bezier));

            let bezierCurve = new Bezier(Object.values(bezier), 2);

            // 获取曲线点
            let points = bezierCurve.getPoints(pointCount);
            console.log("consscscds", pointCount);

            // 获取曲线长度
            let curveLength = bezierCurve.getCurveLength();
            // 计算路程长度
            bezierCurveData.length += curveLength;
            // 存储曲线点
            bezierCurveData.points.push(...points);
            // console.log("points", points);
        }
        console.log("保存路径bezierCurveData", bezierCurveData);
        console.log("保存路径pointCurveDict->", pointCurveDict)
    }

    // 情况所有曲线
    _this.clearAllBezier = function () {
        console.log("clearAllBezier");

        bezierCurveLists = [];
        pointCurveDict.forEach((curve,point) => {
            if (point)
                point.destroy();
        })
        pointCurveDict.clear()
    }

    // ------------------------【私有方法】---------------------------


    // 创建新节点
    let createPoint = function (ident, pos, isSelect = true) {
        let node;
        let name;
        if (ident == lcl.Ident.point) {
            node = cc.instantiate(pointPrefab);
            node.ident = lcl.Ident.point;
            name = "point";
        } else if (ident == lcl.Ident.control) {
            node = cc.instantiate(controlPrefab);
            node.ident = lcl.Ident.control;
            name = "control";
            if (isSelect) lcl.NodeEvents.setMoveTargetNode(node);
        }
        let count = PointNum++;
        node.name = name + "_" + count;
        node.parent = pointParent;
        node.setPosition(pos);
        lcl.NodeEvents.addPointDeleteEvents(node);
        lcl.NodeEvents.addDragEvents(node);
        // 创建编号
        let num = new cc.Node();
        num.parent = node;
        num.y = 20;
        num.addComponent(cc.Label).string = count
        return node
    }

    let getRandPos = function () {
        let randX = Math.random() * resolution.width - resolution.width * 0.5;
        let randY = Math.random() * resolution.height - resolution.height * 0.5;
        return cc.v2(randX, randY)
    }
    // 初始化一个随机曲线
    let initRandCurve = function () {
        let start = createPoint(lcl.Ident.point, getRandPos());
        let control = createPoint(lcl.Ident.control, getRandPos());
        let end = createPoint(lcl.Ident.point, getRandPos());
        lcl.NodeEvents.setMoveTargetNode(null);
        let bezier = { start, control, end }
        BezierData.addBezierCurve(bezier);
        BezierData.saveToPointCurveDict(bezier);
    }

    // 判断该点是起点,终点或者中间点
    let getPointLocation = function (node) {
        let curveObj = pointCurveDict.get(node);
        if (curveObj) {
            if (curveObj["startCurve"] && curveObj["endCurve"]) {
                return "center";
            }
            if (curveObj["startCurve"]) {
                return "start";
            }
            if (curveObj["endCurve"]) {
                return "end";
            }
        }
        return 0;
    }

    // 删除的是中间点
    let deleteCenterPoint = function (point) {
        console.warn("删除的是中间点");

        if (pointCurveDict.has(point)) {
            //中间点有前后两个曲线,删除该点就需要合并两个曲线（这里的方案是保留前面的曲线，删除后面的曲线）
            let CurveObj = pointCurveDict.get(point);
            let prevCurve = CurveObj.endCurve;
            let nextCurve = CurveObj.startCurve;
            // 把前一个曲线的终点移动到后一个曲线的终点上
            prevCurve.end = nextCurve.end;
            // 重新赋值该节点下的曲线对象的end曲线
            let prevEndCurveObj = pointCurveDict.get(prevCurve.end);
            prevEndCurveObj.endCurve = prevCurve;
            pointCurveDict.delete(point);
            // 删除后曲线相关的信息
            for (const key in nextCurve) {
                if (key == "end") continue;
                const _point = nextCurve[key];
                pointCurveDict.delete(_point)
                _point.destroy();
            }
            // pointCurveDict.delete(nextCurve.start)
            // pointCurveDict.delete(nextCurve.control)
            // nextCurve.start.destroy();
            // nextCurve.control.destroy();
            deleteCurveFromBezierLists(nextCurve);
        }
    }
    // 删除的是起点
    let deleteStartPoint = function (point) {
        console.warn("删除的是起点");

        if (pointCurveDict.has(point)) {
            //找到该点关联的曲线
            let CurveObj = pointCurveDict.get(point);
            let startCurve = CurveObj.startCurve;
            CurveObj.endCurve = null;
            // 删除曲线及其相关的点
            let endCurveObj = pointCurveDict.get(startCurve.end);
            endCurveObj.endCurve = null;
            for (const key in startCurve) {
                if (key == "end") continue;
                const _point = startCurve[key];
                pointCurveDict.delete(_point)
                _point.destroy();
            }
            deleteCurveFromBezierLists(startCurve);
        }
    }
    // 删除的是终点
    let deleteEndPoint = function (point) {
        console.warn("删除的是终点");
        if (pointCurveDict.has(point)) {
            let CurveObj = pointCurveDict.get(point);
            let endCurve = CurveObj.endCurve;
            CurveObj.startCurve = null;
            // 删除曲线及其相关的点
            let startCurveObj = pointCurveDict.get(endCurve.start);
            startCurveObj.startCurve = null;
            for (const key in endCurve) {
                if (key == "start") continue;
                const _point = endCurve[key];
                pointCurveDict.delete(_point)
                _point.destroy();
            }
            // pointCurveDict.delete(endCurve.control)
            // endCurve.control.destroy();
            deleteCurveFromBezierLists(endCurve);
        }
    }

    //从曲线列表删除曲线
    let deleteCurveFromBezierLists = function (curve) {
        for (var i = 0, len = bezierCurveLists.length; i < len; i++) {
            const _curve = bezierCurveLists[i];
            if (_curve === curve) {
                bezierCurveLists.splice(i, 1);
                return
            }
        }
    }

    return _this;
}());

module.exports = BezierData;
