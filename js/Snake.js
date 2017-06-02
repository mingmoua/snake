//ES6 全局变量使用const关键字定义：  只读
const northImg = new Image();
northImg.src = "img/north.png";
const southImg = new Image();
southImg.src = "img/south.png";
const eastImg = new Image();
eastImg.src = "img/east.png";
const westImg = new Image();
westImg.src = "img/west.png";
const bodyImg = new Image();
bodyImg.src = "img/body.png";
const foodImg = new Image();
foodImg.src = "img/food.png";
const bgImg = new Image();
bgImg.src = "img/background.png";
//将欢迎界面的图片放在最后，表示加载成功后，其他图片已经加载完毕，无需再进行onload判断
const startImg = new Image();
startImg.src = "img/start.png";
var speednum = 500;//设置定时器的时间，调节速度
//创建一个Snake类，定义其属性及方法
function Snake() {
	this.canvas = $("#gameview")[0]; //canvas画布对象
	this.ctx = this.canvas.getContext("2d"); //画笔
	this.width = 850; //背景（游戏屏幕）的宽度
	this.height = 500; //背景（游戏屏幕）的高度
	this.step = 25; //设计步长
	this.stepX = Math.floor(this.width / this.step); //X轴步数
	this.stepY = Math.floor(this.height / this.step); //Y轴步数
	this.snakeBodyList = []; //设置蛇身数组
	this.foodList = []; //设置食物数组
	this.timer = null;//蛇动时的定时器
	this.score = 0;//分数  +10  存入到localStorage中
	this.isDead = false;//蛇是否活着标识位
	this.isEaten = false;//食物是否被吃掉标识位
	this.isPhone = false;//判断设备是否为移动端
	/*
	 * 1-生成初始化页面，点击该页面，进入游戏
	 */
	this.init = function() {
		this.device();//判断设备类型
		this.ctx.drawImage(startImg, 0, 0, this.width, this.height);//画出开始图片
	}
	/*
	 * 2-游戏开始，绘制背景、蛇、食物,蛇移动
	 */
	this.start = function(){
		this.device();//判断设备类型
		this.score = 0;//积分清0
		this.paint();
		this.move();
	}
	
	//判断设备类型
	this.device = function(){
		//1 读取Bom对象navigator的userAgent信息
		var deviceInfo = navigator.userAgent;
		//2判断是否为pc端，是否含有windows字符串
		if(deviceInfo.indexOf("Windows") == -1){
			this.isPhone = true;
			this.canvas.width = window.innerWidth;//画布的宽度就是当前屏幕的宽度
			this.canvas.height = window.innerHeight;//画布的高度是当前屏幕的高度
			this.width = window.innerWidth;
			this.height = window.innerHeight;
			this.stepX = this.width/this.step;
			this.stepY = this.height/this.step;
		}
	}
	/*
	 * 绘制背景、蛇、食物
	 */
	this.paint = function() {
		//2.1 画出背景
		this.ctx.drawImage(bgImg, 0, 0, this.width, this.height);
		//2.2 画出蛇
		this.drawSnake();
		//2.3 随机画出食物
		this.drawFood();
	}
	/*
	 * 2.2画蛇：算法[{x:横坐标，y：纵坐标，img：图片，direct：运动方向},.......]
	 */
	this.drawSnake = function() {
		//2.2.1循环生成snakeBodyList数组中的对象集合 （默认，蛇居于中间，蛇头向西）
		if(this.snakeBodyList.length<5){
		for(var i = 0; i < 5; i++) {
			//{x:横坐标，y：纵坐标，img：图片，direct：运动方向}蛇的节点设计
			this.snakeBodyList.push({
				x: Math.floor(this.stepX / 2) + i - 2, //注意：x不是px像素坐标点，而是x轴步数
				y: Math.floor(this.stepY / 2), //注意：这是y轴步数
				img: bodyImg,
				direct: "west"
			});
		}
		//2.2.2替换snakeBodyList数组第一个元素的img，替换成westImg蛇头图片
		this.snakeBodyList[0].img = westImg;
		}
		//2.2.3遍历snakeBodyList数组，并画出蛇的初始状态
		for(var i = 0; i < this.snakeBodyList.length; i++) {
			var snode = this.snakeBodyList[i];
			this.ctx.drawImage(snode.img, snode.x * this.step,
				snode.y * this.step, this.step, this.step);
		}
	}
	/*
	 * 2.3画食物
	 */
	this.drawFood = function() {

		//2.3.1当食物已经存在的时候，画面刷新时，食物在原有位置重绘
		if(this.foodList.length > 0) {
			var fnode = this.foodList[0];
			this.ctx.drawImage(fnode.img, fnode.x * this.step, fnode.y * this.step, this.step, this.step);
			return;
		}
		//2.3.2如果食物没有（食物被吃或游戏初始化），生成x，y随机坐标，判断是否与蛇身重复
		//如果重复，重绘，调用this.drawfood(),否则，按照随机生成的点push到数组中，绘制图案
		var foodX = Math.floor(Math.random() * this.stepX);
		var foodY = Math.floor(Math.random() * this.stepY);
		var foodFlag = false; //判断食物与蛇身是否重复的标识位，true重复，false 不重复
		for(var i = 0; i < this.snakeBodyList.length; i++) {
			var snode1 = this.snakeBodyList[i];
			if(foodX == snode1.x && foodY == snode1.y) {
				foodFlag = true;
			}
		}
		if(foodFlag) {
			this.drawFood(); //如果重复，则重绘
		} else {
			this.foodList.push({
				x: foodX,//食物的x
				y: foodY,
				img: foodImg
			}); //新生成一个食物
			//随机换成不同的食物图片
			var foodNum=parseInt(Math.random()*3+1);
			foodImg.src="img/food"+foodNum+".png";
			foodImg.data = foodNum;
			
			var fnode = this.foodList[0];
			this.ctx.drawImage(fnode.img, fnode.x * this.step, fnode.y * this.step, this.step, this.step);
		}

	}
	/*
	 * 3-蛇动（键盘事件改变蛇移动方向，判断蛇是否死掉，然后判断蛇是否吃了食物，之后蛇移动）
	 * 3.1 判断设备如果是pc,响应
	 * 
	 * */
	this.keyHandler = function() { //键盘事件处理器
		//事件处理是异步的，所以，无法传递this对象
		var _this = this;
		//判定方向键是否可用
		var westFlag = false;
		var northFlag = true;
		var eastFlag = false;
		var southFlag = true;
		document.onkeydown = function() {

			var ev = ev || window.event;
			switch (ev.keyCode) {
				case 37: //向左
					if (westFlag == true) {
						_this.snakeBodyList[0].img = westImg;
						_this.snakeBodyList[0].direct = "west";
						westFlag = false;
						eastFlag = false;
						northFlag = true;
						southFlag = true;
					}

					break;

				case 38: //向上
					if (northFlag == true) {

						_this.snakeBodyList[0].img = northImg;
						_this.snakeBodyList[0].direct = "north";
						northFlag = false;
						southFlag = false;
						westFlag = true;
						eastFlag = true;
					}
					break;

				case 39: //向右
					if (eastFlag == true) {
						_this.snakeBodyList[0].img = eastImg;
						_this.snakeBodyList[0].direct = "east";
						westFlag = false;
						eastFlag = false;
						northFlag = true;
						southFlag = true;
					}

					break;

				case 40: //向下
					if (southFlag == true) {

						_this.snakeBodyList[0].img = southImg;
						_this.snakeBodyList[0].direct = "south";
						northFlag = false;
						southFlag = false;
						westFlag = true;
						eastFlag = true;
					}
					break;
			}
		}
	}

	this.touchHandler = function(){//触屏事件处理器
		var _this = this;
		document.addEventListener("touchstart",function(ev){
			
			//console.log(ev);
			var touchX = ev.changedTouches[0].clientX;
			var touchY = ev.changedTouches[0].clientY;
			console.log(touchX+":"+touchY);
			var head = _this.snakeBodyList[0]
			var headX = head.x*_this.step;
			var headY = head.y*_this.step;
			if(head.direct == "north" || head.direct == "south"){
				if(touchX<headX){//触碰的坐标x小于蛇头的坐标x
					head.direct = "west";
					head.img = westImg;
				}else{
					head.direct = "east";
					head.img = eastImg;
				}
			}else if(head.direct == "west" || head.direct == "east"){
				if(touchY<headY){
					head.direct = "north";
					head.img = northImg;
				}else{
					head.direct = "south";
					head.img = southImg;
				}
			}
		})
	}
	this.move = function() {
		if(!this.isPhone){
			this.keyHandler()
		}else{
			this.touchHandler()
		}
		
		
		
		//运用定时器，每隔0.2秒移动蛇（蛇的坐标变化，然后重绘）
		var _this = this;
		this.timer = setInterval(function(){
			//首先：解决蛇身跟随的问题
			for(var i = _this.snakeBodyList.length-1;i>0;i--){
				_this.snakeBodyList[i].x = _this.snakeBodyList[i-1].x;
				_this.snakeBodyList[i].y = _this.snakeBodyList[i-1].y;
			}
			//其次，根据方向及坐标，处理蛇头的移动新坐标
			var shead = _this.snakeBodyList[0];
			switch(shead.direct){
				case 'north':
					shead.y--;
				break;
				case 'south':
					shead.y++;
				break;
				case 'west':
					shead.x--;
				break;
				case 'east':
					shead.x++;
				break;
			}
			//3.1.1判断蛇移动后新位置是否已触边界或自身 true--dead
			_this.dead();
			if(_this.isDead){
				//alert你的最终分数
//				alert("your score is : "+ _this.score)
				$quan = $("<div></div>");
				$quan.css({"border-radius":"25px","width":"1000px","height":"500px","background-color":"gray","margin-left":"10px","margin-top":"90px"})
				$quan.appendTo($(".all"));
				$("#article").hide();
				$(".head").hide();
				$h = $("<h1></h1>");
				$h.html("hahaha~你死了~hahaha");
				$h.css("padding","70px")
				$h.appendTo($quan);
				$h.css("text-align","center")
				$hh = $("<h3></h3>");
				$hh.html("your score is :"+_this.score);
				$hh.appendTo($quan);
				$hh.css({"text-align":"center","margin-top":"5px"});
				$aa = $("<a></a>");
				$aa.html("返回游戏首页")
				$aa.css({"font-size":"18px","margin-left":"450px","margin-top":"100px","display":"inline-block"})
				$aa.click(function(){
					$quan.hide();
					$(".head").show();
					$(".middle").show();
					$(".bgimg").show();
				})
				$aa.appendTo($quan);
				clearInterval(_this.timer);//如果不清除定时器，速度会越来越快
				_this.isDead = false;//改变isDead状态，否则每次直接死掉
				_this.snakeBodyList = [];
//				_this.start();
				
			}else{
				//3.1.2 false 蛇活着，判断蛇头是否与食物的坐标一直，如果一致，清空食物数组
				_this.eat();//判断食物是否被吃，iseaten发生变化
				if(_this.isEaten){
//					console.log("eaten")
					_this.isEaten = false;
					//清空食物数组
					_this.foodList = [];
					//加分
					
					switch(foodImg.data){
						case 1:
						_this.score += 10;
						break;
						case 2:
						_this.score += 20;
						break;
						case 3:
						_this.score += 30;
						break;
					}
					
					//蛇身长一节
					var lastNodeIndex = _this.snakeBodyList.length;
					_this.snakeBodyList[lastNodeIndex] = {
						x:-2,
						y:-2,
						img:bodyImg,
						direct:_this.snakeBodyList[lastNodeIndex-1].direct
					}
				}
				//3.1.3 否则重绘
//				_this.paint();//重绘游戏画面
			}
			
		_this.paint();//重绘游戏画面
		},speednum);
	}
	/*
	 * 4-蛇死（碰到边界或碰到自身--dead 弹出得分界面）
	 */
	this.dead = function() {
		
		const LEFT_END = 0;//左边界
		const RIGHT_END = this.stepX;//右边界
		const NORTH_END = 0;//上边界
		const SOUTH_RND = this.stepY;//下边界
		const headX = this.snakeBodyList[0].x;//蛇头横坐标x
		const headY = this.snakeBodyList[0].y;
		//判断边界
		if(headX <LEFT_END-1|| headY < NORTH_END-1|| headX > RIGHT_END ||headY>SOUTH_RND){
			this.isDead = true;
			return;//精简判断过程
		}
		//判断是否撞到自身
		for(var k = this.snakeBodyList.length-1;k>3;k--){
			if(this.snakeBodyList[k].x == headX && this.snakeBodyList[k].y == headY){
			this.isDead = true;
			}
		}
		
	}
	/*
	 * 5-蛇吃食物（蛇头坐标与食物坐标一致）
	 */
	this.eat = function(){
		
		const HEAD_X = this.snakeBodyList[0].x
		const HEAD_Y = this.snakeBodyList[0].y;
		const FOOD_X = this.foodList[0].x;//食物的x
		const FOOD_Y = this.foodList[0].y;//食物的y
		if(HEAD_X == FOOD_X && HEAD_Y == FOOD_Y){//蛇头的x和食物的相等并且蛇头的y和食物的y相等，说明食物已经被吃了
			this.isEaten = true;
		}
	}
}