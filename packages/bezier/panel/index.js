// panel/index.js, this filename needs to match the one registered in package.json
const Fs = require("fire-fs");
const Path = require("fire-path");


Editor.Panel.extend({

  style: Fs.readFileSync(
    Editor.url("packages://bezier/panel/index.css"),
    "utf-8"
  ),

  template: Fs.readFileSync(
    Editor.url("packages://bezier/panel/index.html"),
    "utf-8"
  ),

  // element and variable binding
  $: {
    btn: '#btn',
    label: '#label',
    pointBtn: '#point',

  },

  // method executed when template and styles are successfully loaded and initialized
  ready() {
    this.$btn.addEventListener('confirm', () => {
      Editor.Ipc.sendToMain('bezier:clicked');
    });
    // this.$pointBtn.addEventListener('click', () => {
    //   Editor.log('Button clicked!');
    // });

    this.addMenuMoveAction_mouse(this.$pointBtn);
  },

  addMenuMoveAction_mouse(node) {
    Editor.log('addMenuMoveAction_mouse');
    node.style.position = "absolute";
    // 计算移动范围
    let doc = document.documentElement;
    node.maxX = doc.clientWidth - node.offsetWidth;
    node.maxY = doc.clientHeight - node.offsetHeight;
    // 是否按下
    node.isMouseDown = false;
    // 事件
    node.addEventListener("mousedown", (e) => {
      e.target.isMouseDown = true;
    }, false);
    node.addEventListener("mousemove", this.moveMenu_mouse, false);
    node.addEventListener("mouseup", (e) => {
      e.target.isMouseDown = false
    }, false);
  },

  //移动
  moveMenu_mouse(event) {
    let node = event.target;
    if (!node.isMouseDown) {
      return;
    }
    Editor.log('moveMenu_mouse offsetWidth:' + node);

    var x = Number(event.clientX) - node.offsetWidth / 2; //页面触点X坐标
    var y = Number(event.clientY) - node.offsetHeight / 2; //页面触点Y坐标
    //限制x y 区间，
    x = x < 0 ? 0 : x;
    x = x > node.maxX ? node.maxX : x;
    y = y < 0 ? 0 : y;
    y = y > node.maxY ? node.maxY : y;
    Editor.log(`x:${x},y${y}`);
    node.style.left = x + "px";
    node.style.top = y + "px";
    node.style.color = "#ff0000"
  },



  // register your ipc messages here
  messages: {
    // 'bezier:hello'(event) {
    //   this.$label.innerText = 'Hello!';
    // }
  }
});