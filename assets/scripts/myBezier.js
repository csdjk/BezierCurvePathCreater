const Bezier = require('./bezier');

const Ident = {
    point: 0,
    control: 1,
    window:2
}

cc.Class({
    extends: cc.Component,
    editor: {
        executeInEditMode: true,
    },

    properties: {
        graphicsNode: cc.Node,
        box: cc.Node,
        point: cc.Prefab,//坐标点
        control: cc.Prefab,//控制点
        bezierColor: cc.hexToColor('#03A8F3'),// 贝塞尔曲线颜色
        lineColor: cc.hexToColor('#e81e63'),//控制线段
        startNode: cc.Node,
        controlNode: cc.Node,
        endNode: cc.Node,
        infoWindow: cc.Node,
        runTime: cc.EditBox,
        msg:cc.Node,
        timeInfo:cc.Label
    },

    onLoad() {
        // 贝塞尔曲线列表
        this.bezierLists = [];
        // 曲线点列表
        this.bezierCurveData = {
            time: Number(this.runTime.string),//运行总时长
            length: 0,//曲线总长
            points: [],//曲线点列表
        }

        // 提示框
        this.notice = this.infoWindow.getChildByName("notice").getComponent(cc.Label);
        this.fileInputBox = this.infoWindow.getChildByName("Input").getChildByName("fileEditBox").getComponent(cc.EditBox);
        this.inputNode = this.node.getChildByName("Input");
        this.initGraphics();
        this.initCurveLists()
        this.initNodeEvents();
        this.saveBezierPath();
        this.hideInfoWindow();
    },

    update(dt) {
        this.drawBezierAll();
        if (this.isStartRun) {
            this.setCountTimeLabel(dt);
        }
    },
    // 初始化Graphics
    initGraphics() {
        this.ctx = this.graphicsNode.getComponent(cc.Graphics);
        this.ctx.lineWidth = 2;
    },
    // 初始化曲线列表
    initCurveLists() {
        this.bezierLists.push({
            start: this.startNode,
            control: this.controlNode,
            end: this.endNode,
        })
    },

    initNodeEvents() {
        this.addTouchEvents(this.node);
        this.startNode.ident = Ident.point;
        this.addTouchEvents(this.startNode);
        this.controlNode.ident = Ident.control;
        this.addTouchEvents(this.controlNode);
        this.endNode.ident = Ident.point;
        this.addTouchEvents(this.endNode);
        // 可移动的窗体
        // this.inputNode.ident = Ident.window;
        // this.addTouchEvents(this.inputNode);
    },


    // 绘制路线
    drawBezierAll() {
        this.ctx.clear();
        for (var i = 0, len = this.bezierLists.length; i < len; i++) {
            const curve = this.bezierLists[i];
            this.drawBezier(curve.start.position, curve.control.position, curve.end.position);
        }
    },
    // 绘制贝塞尔曲线
    drawBezier(startPos, controlPos, endPos) {
        //画笔移动到起始点
        this.ctx.moveTo(startPos.x, startPos.y);
        //线条颜色
        this.ctx.strokeColor = this.bezierColor;
        //绘制贝塞尔曲线
        this.ctx.quadraticCurveTo(controlPos.x, controlPos.y, endPos.x, endPos.y);
        this.ctx.stroke();
        //画笔移动到起始点
        this.ctx.moveTo(endPos.x, endPos.y);
        this.ctx.strokeColor = this.lineColor;
        //绘制直线
        this.ctx.lineTo(controlPos.x, controlPos.y);
        this.ctx.stroke();
        //
    },

    // 是否能移动
    isMove(node) {
        return node.ident == Ident.point || node.ident == Ident.control || node.ident == Ident.window;
    },

    // 添加节点事件
    addTouchEvents(node) {
        let _this = this;
        // 鼠标按下
        node.on(cc.Node.EventType.MOUSE_DOWN, function (event) {
            // event.stopPropagation();
            //创建坐标点,需要先把屏幕坐标转换到节点坐标下
            let mousePos = _this.convertToNodeSpace(event);
            //按下
            this.isMouseDown = true;
            console.log(this)
            // 可以移动的节点
            if (_this.isMove(this)) {
                //指定需要移动的目标节点
                _this.moveTargetNode = this;
            }
            // 空白地方才创建新的
            if (!_this.isMove(this) && !_this.moveTargetNode) {
                //创建新的节点
                _this.createCurve(mousePos);
            }
        });
        // 鼠标移动
        node.on(cc.Node.EventType.MOUSE_MOVE, function (event) {
            //如果是目标节点
            if (_this.isMove(this)) {
                this.opacity = 100;
                cc._canvas.style.cursor = "all-scroll"
            }
            //创建坐标点,需要先把屏幕坐标转换到节点坐标下
            let mousePos = _this.convertToNodeSpace(event);
            //鼠标按下并且有指定目标节点
            if (this.isMouseDown && _this.moveTargetNode) {
                _this.moveTargetNode.setPosition(mousePos);
            }
        });
        // 鼠标离开
        node.on(cc.Node.EventType.MOUSE_LEAVE, function (event) {
            //如果是目标节点
            if (_this.isMove(this)) {
                this.opacity = 255;
                cc._canvas.style.cursor = "auto"
            }
        });
        // 鼠标抬起
        node.on(cc.Node.EventType.MOUSE_UP, function (event) {
            this.isMouseDown = false;
            _this.moveTargetNode = null;
            if (_this.isMove(this)) {
                _this.saveBezierPath();//保存坐标点
            }
        });
    },

    // 创建新曲线
    createCurve(pos) {
        // 创建坐标节点
        let point = cc.instantiate(this.point);
        point.parent = this.node;
        point.ident = Ident.point;
        point.setPosition(pos);
        this.addTouchEvents(point);
        // 创建控制节点
        let control = cc.instantiate(this.control);
        control.parent = this.node;
        control.ident = Ident.control;
        control.setPosition(pos);
        control.isMouseDown = true;
        this.addTouchEvents(control);
        this.moveTargetNode = control;
        // 把曲线列表最后一个点作为新曲线起点
        let start = this.bezierLists[this.bezierLists.length - 1].end;
        let curve = {
            start: start,
            control: control,
            end: point,
        }
        this.bezierLists.push(curve);
    },

    // 屏幕坐标转换到节点坐标
    convertToNodeSpace(event) {
        return this.node.convertToNodeSpaceAR(event.getLocation());
    },



    // ------------------------【保存】---------------------------
    // 保存路径
    saveBezierPath() {
        this.bezierCurveData.length = 0;
        this.bezierCurveData.points = [];

        for (var i = 0, len = this.bezierLists.length; i < len; i++) {
            const bezier = this.bezierLists[i];
            // 创建一个贝塞尔曲线
            let bezierCurve = new Bezier(bezier.start, bezier.control, bezier.end, 100);
            // 获取曲线点
            let points = bezierCurve.getPoints(100);
            // 获取曲线长度
            let curveLength = bezierCurve.getCurveLength();
            // 计算路程长度
            this.bezierCurveData.length += curveLength;
            // 存储曲线点
            this.bezierCurveData.points.push(...points);
            console.log("points", points);
            console.log("bezierCurveData", this.bezierCurveData);

        }
    },
    // save按钮
    save() {
        if (this.fileInputBox.string == "") {
            this.setNoitce("文件名不能为空!");
            return
        }
        if (!this.checkRunTimeInputBox()) {
            this.showMsg("运行时间只能填写数字！！！")
            return
        }
        this.setNoitce('');
        this.computeBezierActions();
        this.saveBezierPathToJson(this.fileInputBox.string);
    },

    //保存为json数据
    saveBezierPathToJson(name) {
        console.log("保存");
        if (cc.sys.isBrowser) {
            console.log("保存", this.bezierCurveData);
            let datas = JSON.stringify(this.bezierCurveData);
            console.log("保存", datas);
            var textFileAsBlob = new Blob([datas], { type: 'application/json' });
            var downloadLink = document.createElement("a");
            downloadLink.download = name;
            downloadLink.innerHTML = "Download File";
            if (window.webkitURL != null) {
                // Chrome允许点击链接
                //而无需实际将其添加到DOM中。 
                downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            }
            else {
                //在点击之前 Firefox要求将链接添加到DOM中
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
        }
    },
    computeBezierActions() {
        this.actionLists = [];
        // 创建动作队列
        for (var i = 0, len = this.bezierCurveData.points.length; i < len; i++) {
            const point = this.bezierCurveData.points[i];
            //计算当前路段需要的时间
            let time = point.length / this.bezierCurveData.length * this.bezierCurveData.time;
            point.time = time;
            // 创建动作
            let action = cc.moveTo(time, cc.v2(point.x, point.y));
            this.actionLists.push(action);
        }
    },

    // 开始播放移动动画
    playMoveAnimation() {
        // 设置初始位置
        // this.box.setPosition(this.bezierLists[0].start);
        // 计算动作队列
        this.computeBezierActions();
        // 开始计时
        this.startCountTime();
        console.time("time")
        this.actionLists.push(cc.callFunc(() => {
            this.stopCountTime();
            console.timeEnd("time")

        }))
        if (this.actionLists.length > 1) {
            this.box.runAction(cc.sequence(this.actionLists));
        } else {
            this.box.runAction(...this.actionLists);
        }
    },

    checkRunTimeInputBox() {
        if (this.runTime.string == "" || isNaN(Number(this.runTime.string))) {
            return false
        }
        return true
    },
    // 设置运行时间
    setRunTime() {
        this.bezierCurveData.time = Number(this.runTime.string);
    },

    // 播放动画
    play() {
        if (!this.checkRunTimeInputBox()) {
            this.showMsg("运行时间只能填写数字！！！")
            return
        }
        this.playMoveAnimation()
        // 
        // this.box.setPosition(this.bezier.startPos);
        // cocos 贝塞尔曲线运动
        // this.box_y.setPosition(this.bezier.startPos);
        // this.box_y.runAction(cc.bezierTo(this.runTime, [this.bezier.startPos, this.bezier.controlPos, this.bezier.endPos]))
    },

    // ------------------------【弹窗设置相关】---------------------------
    showInfoWindow() {
        this.infoWindow.active = true;
        this.setNoitce('');
    },
    hideInfoWindow() {
        this.infoWindow.active = false;
    },
    setNoitce(str) {
        this.notice.string = str;
    },
    showMsg(msg) {
        this.msg.active = true;
        this.msg.getComponent(cc.Label).string = msg
        setTimeout(() => {
            if (this.msg) {
                this.msg.active = false;
            }
        }, 1000);
    },
    // 开始计时
    startCountTime(){
        this.isStartRun = true;
        this.timeInfo.string = 0;
        this.currentRunTime = 0;
    },
    stopCountTime(){
        this.isStartRun = false;
    },
    setCountTimeLabel(dt){
        this.currentRunTime = this.currentRunTime + dt;
        this.timeInfo.string = this.currentRunTime.toFixed(2);
    }
});
