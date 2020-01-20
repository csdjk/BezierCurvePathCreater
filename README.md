# BezierCurvePathCreater
用于创建贝塞尔曲线路径，可匀速运动 - Used to create a Bezier curve path with uniform motion

**该工程基于cocos creator 2.2.2版本!**


[在线演示地址](https://csdjk.github.io/bezierPathCreater.github.io/)(可以直接在上面规划好后导出json文件)

**下面来简单演示一下该工程：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200116192447447.gif)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200116192455200.gif)

初期功能比较简单，暂时只支持**二阶贝塞尔**，支持**匀速**，支持 **导出路径的JSON数据**，
在项目中可以直接读取json文件，里面存储了许多连续的曲线点，直接拿来用即可。
可以根据不同的需求来达到想要的效果。

`匀速运动实现思路很简单，其实就是利用了微积分思想，把曲线分割成许多份，每一份此时就可以看作直线运动了！`

`需要注意的是，该项目分辨率是1920*1080的，在不同的项目中使用可能需要转换下坐标！`

**导出的json数据格式如下图：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200116193649194.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI4Mjk5MzEx,size_16,color_FFFFFF,t_70)


后面有时间会持续更新该项目，添加一下新功能，例如：**三阶贝塞尔曲线** 等等。

**如果你们有什么好的建议，或者发现了bug可以[到这里](https://blog.csdn.net/qq_28299311/article/details/104009804)留言告诉我，我会尽力去完善它。**
<font color="red">
**如果觉得好用的朋友希望能点个赞，关注一下哟，你们的每一个star都是对我最大的鼓励和动力!**

### 该项目是我业余时间弄出来的,如果对你们有所帮助的话可以小小的支持一下我哟! 我也会更加的有动力持续更新下去...
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200119224220592.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI4Mjk5MzEx,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200119224225316.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI4Mjk5MzEx,size_16,color_FFFFFF,t_70)
