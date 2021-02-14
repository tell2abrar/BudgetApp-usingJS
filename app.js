//Data Model
var budgetController=(function(){
	//some code
	function Expense(id,des,val){
		this.id=id;
		this.des=des;
		this.val=val;
		this.per=-1;
	}

	Expense.prototype.calPercentage=function(totallIncome){
		if(totallIncome > 0){
			
			this.per=Math.round((this.val/totallIncome)*100);
		}
	}

	function Income(id,des,val){
		this.id=id;
		this.des=des;
		this.val=val;
	}

	var data={
		allItems:{
			inc:[],
			exp:[]
		},
		totall:{
			inc:0,
			exp:0
		},
		budget:0,
		percentage:-1
	}

	var calculateTotall=function(type){
		var sum=0;
		data.allItems[type].forEach( function(element) {
			sum+=element.val;
		});
		data.totall[type]=sum;
	}

	return{
		addItem:function(type,description,value)
		{	
			var newItem,id;
			if(data.allItems[type].length > 0)
			{
				id=data.allItems[type][data.allItems[type].length-1].id+1;
			}else{
				id=0;
			}
			if(type=="inc"){
				 newItem=new Income(id,description,value);
			}else if(type=="exp"){
				newItem=new Expense(id,description,value);
			}
			data.allItems[type].push(newItem);

			return newItem;

		},

		calculatePercentage:function(){
			data.allItems.exp.forEach(function(cur){
				cur.calPercentage(data.totall.inc);

			})
		},
		getPercentage:function(){
			var allPercentage=data.allItems.exp.map(function(cur){
				return cur.per;
			});
			return allPercentage;
		},

		deleteItem:function(type,id){
			var arrayOfIds,index;
			arrayOfIds=data.allItems[type].map(function(current){
				return current.id;
			})
			index=arrayOfIds.indexOf(id);
			data.allItems[type].splice(index,1);

		},

		testing:function()
		{
			console.log(data);
		},
		calculateBudget:function(){

			// 1.Calculate Totall Income && expnse
				calculateTotall("inc");
				calculateTotall("exp");

			// 2.Calcualte Budget : income-expense
			data.budget=data.totall.inc-data.totall.exp;

			// 3.Calculate percentage
			if(data.totall.inc >0)
			{
				data.percentage=Math.round((data.totall.exp/data.totall.inc)*100);
			}else{
				data.percentage=-1;
			}
		},
		getBudget:function(){
			return{
				net:data.budget,
				inc:data.totall.inc,
				exp:data.totall.exp,
				per:data.percentage
			};
	}

	}


})();




//UI Model
var uiController=(function(){
	var des,type,val;
	var domString={
		description:".add__description",
		typ:".add__type",
		value:".add__value",
		addButton:".add__btn",
		expenseContainer:".expenses__list",
		incomeContainer:".income__list",
		budgetValue:".budget__value",
		incomeValue:".budget__income--value",
		expenseValue:".budget__expenses--value",
		percentageValue:".budget__expenses--percentage" 

	}



	return{
		getInput:function(){
			return{
				des:document.querySelector(domString.description).value,
				type:document.querySelector(domString.typ).value,
				val:parseFloat(document.querySelector(domString.value).value)
			};
		},
		getDomString:function(){
			return domString;
		},

		addItem:function(item,type)
		{
			var html,element,newHtml;
			if(type=="exp"){
				element=domString.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if(type=="inc") {
				element=domString.incomeContainer;
				html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}

			newHtml=html.replace("%id%",item.id);
			newHtml=newHtml.replace("%des%",item.des);
			newHtml=newHtml.replace("%value%",item.val);
			document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
		},

		deleteItem:function(itemID){
			var itemToBeDeleted=itemID;
			itemToBeDeleted=document.getElementById(itemToBeDeleted);
			document.getElementById(itemID).parentNode.removeChild(itemToBeDeleted);
		},

		updateUI:function(percentages){

			var targetDom=document.querySelectorAll(".item__percentage");


			function nodeListForEach(targetDom,callback){
				for(var i=0;i<targetDom.length;++i)
				{
					callback(targetDom[i],i);
				}
			}

			nodeListForEach(targetDom,function(curr,i){
				if(percentages[i] > 0)
				{	
					curr.textContent=percentages[i] + "%";
				}
				else
				{
					curr.textContent="---";
				}
			});


		},

		clearInput:function(){
			var fields=document.querySelectorAll(domString.description+","+domString.value);
			Array.prototype.slice.call(fields);
			fields.forEach( function(element) {
				element.value="";
			});
			fields[0].focus();

		},
		displayBudget:function(budget){

			document.querySelector(domString.budgetValue).textContent=budget.net;
			document.querySelector(domString.incomeValue).textContent=budget.inc;
			document.querySelector(domString.expenseValue).textContent=budget.exp;
			if(budget.per!=-1)
			{
				document.querySelector(domString.percentageValue).textContent=budget.per+"%";
			}else{
				document.querySelector(domString.percentageValue).textContent="---";
			}
			


		}


	};







})();


//App Controller
var appController=(function(bgControll,uiControll){

		function startEventListener(){
			var ctrlDomString=uiControll.getDomString();
			document.querySelector(ctrlDomString.addButton).addEventListener("click",function(){

				ctrlAddItem();
			});
			document.addEventListener("keypress",function(e){
				if(e.which===13){
				ctrlAddItem();
				}
			});

			document.querySelector(".container").addEventListener("click",ctrlDeleteItem);
		}

		function updateBudget()
		{
			// 1.Calculate Budget
				bgControll.calculateBudget();
			
			// 2.Return Budget
				var budget=bgControll.getBudget();

			// 3.Update Budget Ui
				uiControll.displayBudget(budget);

		}

		function updatePercentage(){

			// 1.Calculate the percentages
				bgControll.calculatePercentage();

			// 2.Return the Percentages
				var percentages=bgControll.getPercentage();
					console.log(percentages);
			// 3.Update the percentage UI
				uiControll.updateUI(percentages);
		}

		function ctrlAddItem(){

				// 1.Get the data from input fields
					var items=uiControll.getInput();
					if(!isNaN(items.val) && items.val>0){
						// 2.Add item to budget Controller
							var newItem;
							newItem=bgControll.addItem(items.type,items.des,items.val);

						// 3.Update the UI
							uiControll.addItem(newItem, items.type);
							uiControll.clearInput();

						// 4.Update Budget
				  		   updateBudget();

				  		// 5.Update the Percentages
				  			updatePercentage();
					}
		}

		function ctrlDeleteItem(e){

			var itemID,id,type,splitItemID;
			itemID=e.target.parentNode.parentNode.parentNode.parentNode.id;
			// console.log(itemId);
			if(itemID){
				splitItemID=itemID.split("-");
				// console.log(itemID);
				type=splitItemID[0];
				id=parseInt(itemID[1]);

				// 1.Delete Item from the datastructure
					bgControll.deleteItem(type,id);

				// 2.Delete item from UI
					uiControll.deleteItem(itemID);

				// 3.Update the budget
					updateBudget()

				// 4.Update the Percentages
					updatePercentage();

			}

		}

		return{
			init:function()
			{
				console.log('Application starts');
				startEventListener();
				uiControll.displayBudget({
					net:0,
					inc:0,
					exp:0,
					per:0
				})
			}
		}





})(budgetController,uiController);

appController.init();