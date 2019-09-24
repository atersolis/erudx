import { useReducer } from "preact/hooks";

let originalAction = Symbol("originalAction");
let reducer = Symbol("reducer");
let commitFunc = Symbol("commitFunc");
let dispatch = Symbol("dispatch");

export function action(
	target,
	actionType: string,
	descriptor: TypedPropertyDescriptor<(...s: any[]) => void>
): any {
	console.log(actionType);
	let original = descriptor.value;
	descriptor.value = function(...a: any[]) {
		console.log("Calling dispatch");
		this[dispatch]({
			type: actionType,
			payload: a
		});
		original.apply(this, a);
	};
	Object.defineProperty(descriptor.value, originalAction, {
		value: original,
		writable: false
	});
	return descriptor;
}

/*function store<T extends new (...args: any[]) => any>(C: T = null) {
	C === null ? Object : C;
	return class Store extends C {
		constructor(...s: any[]) {
			super(...s);
			Object.freeze(this);
		}
	};
}*/

export function useStore<T>(C: new (...args: any[]) => T, ...a: any[]): T {
	let O = new C(...a);
	let [state, disp] = useReducer(C[reducer], O);
	Object.defineProperty(state, dispatch, { value: disp });
	return state;
}

export class Store {
	protected commit(t: any): void {
		this[commitFunc](t);
	}
	protected set(p: string, a: any) {}
}

export function store(target) {
	let proto = target.prototype;
	let actions = {};
	for (let methodName in proto) {
		if (proto[methodName][originalAction]) {
			actions[methodName] = proto[methodName][originalAction];
		}
	}

	target[reducer] = function reducer(state, action) {
		if (action && action.type && actions[action.type]) {
			let newState = state;
			Object.defineProperty(state, commitFunc, {
				value: t => (newState = t)
			});
			actions[action.type].apply(state, action.payload);
			return newState;
		} else {
			throw new Error(`Action does not exists`);
		}
	};
}