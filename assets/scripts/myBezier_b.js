
cc.Class({
    extends: cc.Component,
    editor: {
        executeInEditMode: true,
    },

    properties: {
        graphicsNode: cc.Node,
        box: cc.Node,
        box_y: cc.Node,
        pointPosLists: [cc.Node],
        controlPosLists: [cc.Node],
        infoWindow: cc.Node,
    },

    start() {
        this.runTime = 2;
        this.bezierColor = cc.hexToColor('#03A8F3');
        this.lineColor = cc.hexToColor('#e81e63');
        this.notice = this.infoWindow.getChildByName("notice").getComponent(cc.Label);
        this.inputBox = this.infoWindow.getChildByName("Input").getChildByName("EditBox").getComponent(cc.EditBox);

        this.bezierLists = [];
        this.hideInfoWindow();
        this.initGraphics();
        this.initNodeEvents();
        this.saveBezierPath();
    },

    initGraphics() {
        this.ctx = this.graphicsNode.getComponent(cc.Graphics);
        this.ctx.lineWidth = 2;
        this.updateNodePos();
    },

    initNodeEvents() {
        this.addTouchEvents(this.node);
        for (var i = 0, len = this.pointPosLists.length; i < len; i++) {
            const node = this.pointPosLists[i];
            node.isMove = true;
            this.addTouchEvents(node);
        }
        for (var i = 0, len = this.controlPosLists.length; i < len; i++) {
            const node = this.controlPosLists[i];
            node.isMove = true;
            this.addTouchEvents(node);
        }
    },

    updateNodePos() {
        this.startPos = this.pointPosLists[0].position;
        this.pointPos1 = this.pointPosLists[1].position;
        this.pointPos2 = this.pointPosLists[2].position;
        this.endPos = this.pointPosLists[3].position;

        // 贝塞尔曲线控制点
        this.controlPos1 = this.controlPosLists[0].position;
        this.controlPos2 = this.controlPosLists[1].position;
        this.controlPos3 = this.controlPosLists[2].position;
    },

    drawBezierAll() {
        this.ctx.clear();
        //起点 - point1
        this.drawBezier(this.startPos, this.controlPos1, this.pointPos1);
        //point1 - point2
        this.drawBezier(this.pointPos1, this.controlPos2, this.pointPos2);
        // point2 - 终点
        this.drawBezier(this.pointPos2, this.controlPos3, this.endPos);
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
    // 保存路径
    saveBezierPath() {
        this.bezierLists = [];
        for (var i = 0, len = this.controlPosLists.length; i < len; i++) {
            this.bezierLists.push({
                startPos: this.pointPosLists[i].position,
                controlPos: this.controlPosLists[i].position,
                endPos: this.pointPosLists[i + 1].position
            });
        }
        console.log(this.bezierLists);
    },

    save() {
        if (this.inputBox.string == "") {
            this.notice.string = "文件名不能为空!"
            return
        }
        this.setNoitce('');
        this.saveBezierPathToJson(this.inputBox.string);
    },

    // 保存为json数据
    saveBezierPathToJson(name) {
        console.log(JSON.stringify(this.bezierLists));
        // jsb.fileUtils获取全局的工具类的实例, cc.director;
        // 如果是在电脑的模拟器上，就会是安装路径下模拟器的位置;
        // 如果是手机上，那么就是手机OS为这个APP分配的可以读写的路径; 
        // jsb --> javascript binding --> jsb是不支持h5的
        var writeable_path = jsb.fileUtils.getWritablePath();//=>  D:\CocosCreator\resources\cocos2d-x\simulator\win32
        console.log("writeable_path: " + writeable_path);
        // 要在可写的路径先创建一个文件夹
        var new_dir = writeable_path + "path";
        // 路径也可以是 外部存储的路径，只要你有可写外部存储的权限;
        // getWritablePath这个路径下，会随着我们的程序卸载而删除,外部存储除非你自己删除，否者的话，卸载APP数据还在;
        if (!jsb.fileUtils.isDirectoryExist(new_dir)) {
            jsb.fileUtils.createDirectory(new_dir);
        }
        else {
            console.log("dir is exist!!!");
        }
        jsb.fileUtils.writeStringToFile(JSON.stringify(this.bezierLists), `${new_dir}/${name}.json`);
        this.setNoitce(`保存成功,JSON文件路径：\n${new_dir}/${name}`);
    },


    // 添加节点事件
    addTouchEvents(node) {
        let _this = this;
        // 鼠标按下
        node.on(cc.Node.EventType.MOUSE_DOWN, function (event) {
            //是否按钮
            this.isMouseDown = true;
            //指定需要移动的目标节点
            if (this.isMove) _this.moveTargetNode = this;
        });
        // 鼠标移动
        node.on(cc.Node.EventType.MOUSE_MOVE, function (event) {
            //创建坐标点,需要先把屏幕坐标转换到节点坐标下
            let mousePos = _this.convertToNodeSpace(event);
            //鼠标按下并且有指定目标节点
            if (this.isMouseDown && _this.moveTargetNode) {
                _this.moveTargetNode.setPosition(mousePos);
            }
            //如果是目标节点
            if (this.isMove) {
                this.opacity = 100;
                cc._canvas.style.cursor = "all-scroll"
            }
        });
        // 鼠标离开
        node.on(cc.Node.EventType.MOUSE_LEAVE, function (event) {
            //如果是目标节点
            if (this.isMove) {
                this.opacity = 255;
                cc._canvas.style.cursor = "auto"
            }
        });
        // 鼠标抬起
        node.on(cc.Node.EventType.MOUSE_UP, function (event) {
            this.isMouseDown = false;
            _this.moveTargetNode = null;
            if (this.isMove) {
                _this.saveBezierPath();
            }
            // console.log('Mouse MOUSE_UP');
        });
    },


    // 屏幕坐标转换到节点坐标
    convertToNodeSpace(event) {
        return this.node.convertToNodeSpaceAR(event.getLocation());
    },

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


    update(dt) {
        this.updateNodePos();
        this.drawBezierAll();
        this.onBezierMoveTo(dt, this.runTime);
    },

    //贝塞尔曲线运动
    onBezierMoveTo(dt, runTime) {

        if (this.currentRunTime == null || runTime == null || this.currentRunTime >= runTime) {
            return
        }

        this.currentRunTime += dt;
        let t = this.currentRunTime / runTime;

        // 二阶贝塞尔曲线
        var x = Math.pow(1 - t, 2) * this.bezier.startPos.x
            + 2 * t * (1 - t) * this.bezier.controlPos.x
            + Math.pow(t, 2) * this.bezier.endPos.x;
        var y = Math.pow(1 - t, 2) * this.bezier.startPos.y
            + 2 * t * (1 - t) * this.bezier.controlPos.y
            + Math.pow(t, 2) * this.bezier.endPos.y;

        console.log(`x:${x},y:${y}`);

        this.box.setPosition(x, y);
        console.log(`currentRuntime: ${this.currentRunTime}`)
    },


    


    // 播放动画
    play() {
        this.bezier = this.bezierLists[0];
        this.currentRunTime = 0;
        this.box.setPosition(this.bezier.startPos);

        // this.box_y.setPosition(this.bezier.startPos);
        // this.box_y.runAction(cc.bezierTo(this.runTime, [this.bezier.startPos, this.bezier.controlPos, this.bezier.endPos]))

        //--------------------
        // this.box.setPosition(this.bezierLists[0].startPos);
        // let actionLists = [];
        // for (var i = 0, len = this.bezierLists.length; i < len; i++) {
        //     const bezier = this.bezierLists[i];

        //     var bezierTo = cc.bezierTo(2, [bezier.startPos, bezier.controlPos, bezier.endPos]);
        //     actionLists.push(bezierTo)
        // }
        // let sq = cc.sequence(actionLists)
        // this.box.runAction(sq);

    },
    //------------------------------------
    playMoveAnimation() {
        let nodeFishComp = node.getComponent("nodeFish")
        nodeFishComp.setFish(fish)
        nodeFishComp.setFishLine(item)
        nodeFishComp.setFishPath(fishPath)
        nodeFishComp.startMove(time - item.showTime)
    }

});
