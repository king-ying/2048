function Task(div,stepL,stepT){
	this.div=div;
	this.stepL=stepL;
	this.stepT=stepT;
}
var animation={
	DURATION:50,
	STEPS:50,
	interval:0,
	timer:null,
	moved:0,
	CSIZE:100,
	OFFSET:16,
	tasks:[],   //存放对象
	init:function(){
		this.interval=this.DURATION/this.STEPS;
	},
	addTask:function(endr,endc,startr,startc){  //将要移动的div和步长添加到数组
		var div=document.getElementById("c"+startr+startc);
		var stepL=
			(endc-startc)*(this.CSIZE+this.OFFSET)/this.STEPS;
		var stepT=
			(endr-startr)*(this.CSIZE+this.OFFSET)/this.STEPS;
		this.tasks.push(
			new Task(div,stepL,stepT)	
		);
	},
	play:function(callback){  //启动动画
		this.timer=
			setInterval(this.playStep.bind(this,callback),this.interval)
	},
	playStep:function(callback){  //移动一步
		//遍历tasks中的每项任务
			//获得当前task的div计算后的样式，
		for (var i=0;i<this.tasks.length ;i++ )
		{
			var div=this.tasks[i].div;
			var style=getComputedStyle(div);
			//设置当前task的div的left为style的left转为浮点数+当前的task的stepL
			this.tasks[i].div.style.left=
					parseFloat(style.left)+this.tasks[i].stepL+"px";
			this.tasks[i].div.style.top=
					parseFloat(style.top)+this.tasks[i].stepT+"px";
		}
		this.moved++;
		if (this.moved==this.STEPS)
		{
			clearInterval(this.timer);
			this.timer=null;
			this.moved=0;
			for (var i=0;i<this.tasks.length ;i++ )
			{
				this.tasks[i].div.style.left="";
				this.tasks[i].div.style.top="";
			}
			this.tasks=[];
			callback();  //调用callback
		}
	},
}
animation.init();