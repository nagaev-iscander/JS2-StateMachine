//Stack for saving context for functions useContext, useState
var stack=[];
function AddContext(element)
{
	stack.push(element);
	return 1;
}

function RemoveContext()
{
	stack.pop();
	return 1;
}

function GetContext()
{
	let context=stack[stack.length-1];
	return context;
}
//-----------------------------------

//changing state of machine to newStateew state
function ChangeState(currentContext, newState) {
	let old_state=currentContext.currentState;
	//actions for leaving state "notResponded"
	if(old_state=='notResponded' && newState!='notResponded') {
		let type=typeof(currentContext.states.notResponded.onExit);
		if(type=="string")	{//name of function
			let actionName=currentContext.states.responded.onExit;
			currentContext.actions[actionName]();
		}
		else if(type=="function") {//function itself
			currentContext.states.notResponded.onExit();
		}
	}

	//changing state
	currentContext.currentState=newState;

	//actions for entering state "responded"
	if(old_state!='responded' && newState=='responded') {
		let type=typeof(currentContext.states.responded.onEntry);
		if(type=="string") {//name of function
			let actionName=currentContext.states.responded.onEntry;
			currentContext.actions[actionName]();
		}
		else if(type=="function") {//function itself)
			currentContext.states.responded.onEntry();
		}
	}
}

//creating machine with user object
function machine(InputObject) {
	var object=new Object();
	object.MachineDescription=InputObject;	//save user object
	object.MachineDescription.currentState=object.MachineDescription.initialState;	//adding state to machine
	//defining transition function
	function transition(transactionName, InputResume) {
		//1. Push context to stack
		AddContext(object.MachineDescription);
		//2. make actions needed
		let currentState=object.MachineDescription.states[object.MachineDescription.currentState];
		if(currentState!=undefined && object.MachineDescription.currentState=='notResponded') {
			//try to find service
			var transaction=currentState.on[transactionName];
			if(transaction!=undefined && transaction.service!=undefined) {
				console.log(transaction.service(InputResume));
			}
			else {//no service found
				ChangeState(object.MachineDescription, 'responded');
			}
		}
		//3. Remove context from stack
		RemoveContext();

		return 1;
	}

/*
if actions can be called by user e.g.
vacancyMachine.actions.onStateEntry({resume: {name: 'Vasya', lastName: 'Pupkin'}});
we should redefine actions something like follows:
	function onStateEntry(event) {
		AddContext(object.MachineDescription);
		res=object.MachineDescription.actions.onStateEntry(event)
		RemoveContext();
		return res;
	}

	object.actions=new Object();
	object.actions.onStateEntry=onStateEntry;
*/
	object.transition = transition;
	return object;
}

//working with context and state
function useContext() {
	let context=GetContext();
	function setContext(InputContext) {
		let innerContext=GetContext();
		Object.assign(innerContext.context, InputContext); 
	}

	return [context, setContext];
}

function useState() {
	let context=GetContext();
	function setState(InputState) {
		let innerContext=GetContext();
		ChangeState(innerContext, InputState); 
	}

	return [context.currentState, setState];
}

export {machine, useContext, useState};
