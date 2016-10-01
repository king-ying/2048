function setCookie(cname,val){   //设置缓存
	var date=new Date();
	date.setDate(date.getDate()+14);
	document.cookie=cname+"="+val+";expires="+
				date.toGMTString();
}
function getCookie(cname){
	var str=document.cookie;
	var i=str.indexOf(cname);
	if (i!=-1)
	{
		i=i+cname.length+1;
		var endi=str.indexOf(";",i);
		if (endi==-1)
		{
			return str.slice(i,str.length);  
		}else{
			return str.slice(i,endi);
		}
	}else{
		return undefined;
	}
}
var game={
	data:null,//保存r行*c列的二位数组
	RN: 4,
	CN:4,
	CSIZE:100,
	OFFSET:16,
	score:0,  //保存当前得分
	top:0,  //保存最高分
	state:1,  //游戏状态
	RUNNING:1,  
	GAMEOVER:0,
	PLAYING:2,
	init:function(){  //根据RN和CN动态生成div
		//得到保存在cookie中的最高分
		this.top=getCookie("top")||0;
		for (var r=0,arr=[];r<this.RN ;r++ )
			for (var c=0;c<this.CN ;c++ )
				arr.push(""+r+c);
		var html='<div id="g'+arr.join(
			'" class="grid"></div><div id="g')+'" class="grid"></div>';
		html+='<div id="c'+arr.join(
			'" class="cell"></div><div id="c')+'" class="cell"></div>';
		var grid=document.getElementById("gridPanel") ; 
		grid.innerHTML=html;
		//计算容器宽width
		var width=this.CN*(this.CSIZE+this.OFFSET)+this.OFFSET;
		var height=this.RN*(this.CSIZE+this.OFFSET)+this.OFFSET;
		grid.style.width=width+"px";
		grid.style.height=height+"px";
	},
	//强调
		//对象中用到自己的属性，必须加this
		//每个属性和方法之间，用,分割
	start:function(){   //启动游戏
		//创建空数组保存到data属性中
		this.init();
		this.data=[];
		this.score=0;  //游戏开始时重置分数为0
		this.state=this.RUNNING;//重置游戏状态为运行
		//r从0开始到<RN结束
		//向data中压入一个空数组
			//c从0开始，到<CN结束
			//向data中r行的子数组压入一个0
		for (var r=0;r<this.RN ;r++ )
		{
			this.data.push([]);
			for (var c=0;c<this.CN ;c++ )
			{
				this.data[r].push(0);
			}  //生成随机数组
		}
		
		//调用randomNum随机生成一个随机数
		//调用randomNum随机生成一个随机数
		this.randomNum();
		this.randomNum();
		//调用方法，更新数据到页面
		this.updataView();
		//debugger;
		//console.log(this.data.join("\n"));
		//为页面绑定键盘按下事件
		document.onkeydown=function(e){
			//判断按键的编号 
			switch(e.keyCode){  //this指document
				case 37:this.moveLeft();break;
				case 38:this.moveUp();break;
				case 39:this.moveRight();break;
				case 40:this.moveDown();break;
			}
		}.bind(this);  //this指game
	},
	//在data中一个随机的空位置，生成一个2或者4
	randomNum:function(){
		while (true)   //循环的目的是在 空盒子 中生成数据 避免重复
		{	//随机生成一个r行c列
			var r=parseInt(Math.random()*this.RN);
			var c=parseInt(Math.random()*this.CN);
			if (this.data[r][c]==0)
			{	//0~1生成个一个小数  2和4出现的几率
				this.data[r][c]=Math.random()<=0.5?2:4;
				break;
			}
		}
	},
		//将data的数据更新到页面
	updataView:function(){
		//遍历二维数组data
		for (var r=0;r<this.RN ;r++ )
		{
			for (var c=0;c<this.CN ;c++ )
			{
				var div=document.getElementById('c'+r+c);
				if (this.data[r][c]!=0)
				{
					div.innerHTML=this.data[r][c];
					div.className="cell n"+this.data[r][c];  //方便为这个div添加背景颜色
				}else{
					div.innerHTML="";
					div.className="cell";
				}
			}
		}
		document.getElementById("score").innerHTML=this.score;
		var gameover=document.getElementById("gameOver");
		if (this.state==this.GAMEOVER)
		{
			gameover.style.display="block";
			document.getElementById("fscore").innerHTML=this.score;
		}else{
			gameover.style.display="none";
		} 
		document.getElementById("top").innerHTML=this.top;
	},
	//左移所有行
	moveLeft:function(){
		//遍历每一行
		this.move(function(){
			for (var r=0;r<this.RN ;r++ )
			{
				this.moveLeftInRow(r);
			}
		}.bind(this));
	},
	moveLeftInRow:function(r){ //左移第r列
		for (var c=0;c<this.CN-1 ;c++ )
		{
			//this.data[r][c];
			var nextc=this.getNextInRow(r,c); 
			if (nextc==-1)
			{
				break;
			}else{
				if (this.data[r][c]==0)
				{
					this.data[r][c]=this.data[r][nextc];
					animation.addTask(r,c,r,nextc);
							//r,c目标位置 r,nextc 起始位置
					this.data[r][nextc]=0;
					c-=1;
				}else{
					if (this.data[r][c]==this.data[r][nextc])
					{
						this.data[r][c]*=2;
						animation.addTask(r,c,r,nextc);
						this.score+=this.data[r][c];
						this.data[r][nextc]=0;
					}
				}
			}
		}
		//debugger;
	},
		//查找c列右侧下一个 不为0 的位置，找不到，则返回-1，找到的话就返回值
	getNextInRow:function(r,c){
		for (var nextc=c+1;nextc<this.CN ;nextc++ )
		{
			if (this.data[r][nextc]!=0)
			{
				return nextc;
			}
		}
		return -1;
	},
		//重构
	move:function(fun){
		if (this.state==this.RUNNING)
		{
			var before=String(this.data);  //移动前拍照 用string
			fun();    //没有用任何对象调用的函数，this指向window
			var after=String(this.data);  //移动后拍照
			if (before!=after)
			{	
				this.state=this.PLAYING;
				animation.play(
					function(){  //将一段程序作为参数时 用回调
						this.randomNum();
						//如果游戏结束
							//就修改游戏状态为GAMEOVER
						if (this.isGameOver())
						{
							this.state=this.GAMEOVER;
							if (this.score>this.top)
							{
								setCookie("top",this.score);
							}
						}
						this.updataView();
						this.state=this.RUNNING;
				}.bind(this)
				);   //启动动画  
			}
		}
	},
	isGameOver:function(){
		for (var r=0;r<this.RN ;r++ )
		{
			for (var c=0;c<this.CN ;c++ )
			{
				if (this.data[r][c]==0)
				{
					return false;  //继续游戏
				}
				if (c<this.CN-1&&this.data[r][c]==this.data[r][c+1])
				{
					return false;
				}
				if (r<this.RN-1&&this.data[r][c]==this.data[r+1][c])
				{
					return false;
				}
			}
		}
		return true;   //表示游戏结束
	},
	moveRight:function(){  //右移
		/*var before=String(this.data);  //移动前拍照 用string
		for (var r=0;r<this.RN ;r++ )
		{
			this.moveRightInRow(r);
		}
		var after=String(this.data);  //移动后拍照
		if (before!=after)
		{	
			this.randomNum();
			this.updataView();
		}*/
		this.move(function(){
			for (var r=0;r<this.RN ;r++ )
			{
				this.moveRightInRow(r);
			}
		}.bind(this));
	},
	moveRightInRow:function(r){ //右移第r列
		for (var c=this.CN-1;c>=0 ;c-- )
		{
			//this.data[r][c];
			var prevc=this.getPrevInRow(r,c); 
			if (prevc==-1)
			{
				break;
			}else{
				if (this.data[r][c]==0)
				{
					this.data[r][c]=this.data[r][prevc];
					animation.addTask(r,c,r,prevc);
					this.data[r][prevc]=0;
					c+=1;
				}else{
					if (this.data[r][c]==this.data[r][prevc])
					{
						this.data[r][c]*=2;
						animation.addTask(r,c,r,prevc);
						this.score+=this.data[r][c];
						this.data[r][prevc]=0;
					}
				}
			}
		}
		//debugger;
	},
		//查找c列左侧前一个不为0的位置
	getPrevInRow:function(r,c){
		for (var prevc=c-1;prevc>=0 ;prevc-- )
		{
			if (this.data[r][prevc]!=0)
			{
				return prevc;
			}
		}
		return -1;
	},
	moveUp:function(){   //上移
		/*var before=String(this.data);  //移动前拍照 用string
		for (var c=0;c<this.CN ;c++ )
		{
			this.moveUpInCol(c);
		}
		var after=String(this.data);  //移动后拍照
		if (before!=after)
		{	
			this.randomNum();
			this.updataView();
		}*/
		this.move(function(){
			for (var c=0;c<this.CN ;c++ )
			{
				this.moveUpInCol(c);
			}
		}.bind(this));
	
	},
	moveUpInCol:function(c){ //上移第r行
		for (var r=0;r<this.RN-1 ;r++ )
		{
			//this.data[r][c];
			var nextr=this.getNextInCol(r,c); 
			if (nextr==-1)
			{
				break;
			}else{
				if (this.data[r][c]==0)
				{
					this.data[r][c]=this.data[nextr][c];
					animation.addTask(r,c,nextr,c);
					this.data[nextr][c]=0;
					r-=1;
				}else{
					if (this.data[r][c]==this.data[nextr][c])
					{
						this.data[r][c]*=2;
						animation.addTask(r,c,nextr,c);
						this.score+=this.data[r][c];
						this.data[nextr][c]=0;
					}
				}
			}
		}
		//debugger;
	}, 
		//查找r行下一个不为0的位置
	getNextInCol:function(r,c){
		for (var nextr=r+1;nextr<this.RN ;nextr++ )
		{
			if (this.data[nextr][c]!=0)
			{
				return nextr;
			}
		}
		return -1;
	},
	moveDown:function(){   //下移
		/*var before=String(this.data);  //移动前拍照 用string
		for (var c=this.CN-1;c>=0 ;c--)
		{
			this.moveDownInCol(c);
		}
		var after=String(this.data);  //移动后拍照
		if (before!=after)
		{	
			this.randomNum();
			this.updataView();
		}*/
		this.move(function(){
		for (var c=this.CN-1;c>=0 ;c--)
		{
			this.moveDownInCol(c);
		}
		}.bind(this));
	
	},
	moveDownInCol:function(c){ //下移第r行
		for (var r=this.RN-1;r>=0 ;r-- )
		{
			//this.data[r][c];
			var prevr=this.getPrevInCol(r,c); 
			if (prevr==-1)
			{
				break;
			}else{
				if (this.data[r][c]==0)
				{
					this.data[r][c]=this.data[prevr][c];
					animation.addTask(r,c,prevr,c);
					this.data[prevr][c]=0;
					r+=1;
				}else{
					if (this.data[r][c]==this.data[prevr][c])
					{
						this.data[r][c]*=2;
						animation.addTask(r,c,prevr,c);
						this.score+=this.data[r][c];
						this.data[prevr][c]=0;
					}
				}
			}
		}
		//debugger;
	},
		//查找r行上一个不为0的位置
	getPrevInCol:function(r,c){
		for (var prevr=r-1;prevr>=0 ;prevr-- )
		{
			if (this.data[prevr][c]!=0)
			{
				return prevr;
			}
		}
		return -1;
	},
}

//页面一加载后，自动启动游戏
window.onload=function(){
	game.start();
}
//debug:
//1.debugger 将程序停在关键的位置，鼠标移入可能出错的位置，实时查看变量值
//2.打桩：程序关键位置，输出关键变量的值