import {
	dispatch,
	reducer,
	beforeCloneSymb,
	afterCloneSymb,
	cloneSymb,
	routerAction,
	actionSave,
	define,
	assertHasReducer
} from "./utils";

import { isStore } from "./utils";
export { isStore } from "./utils";

// ----------------------------------------------------------------------------
//                               DECORATORS
// ----------------------------------------------------------------------------

/**
 * Method decorator.
 * Replace original method by a function dispatching action.
 * Save original method as a hidden property of new method.
 */
export function action(_, type: string, descriptor: PropertyDescriptor) {
	let original = descriptor.value;
	descriptor.value = function (...args: any[]) {
		if (!this[dispatch]) {
			let className = this.constructor.name;
			throw new Error(
				`Could not find dispatch function on object of class ${className}.\n` +
				`Did you forget to call 'createStore', 'useStore' or 'mount' ? \n` +
				`Please read the documentation to learn how to use store objects.`
			);
		}
		else if (typeof this[dispatch] !== "function") {
			let className = this.constructor.name;
			throw new Error(`{this[dispatch]} must be a function. {this} is of type ${className}`)
		}
		else {
			this[dispatch]({ type, payload: args });
		}
	};
	define(descriptor.value, actionSave, original);
	return descriptor;
}

/**
 * Method decorator. Mark current method as router method
 */
export function route(target, methodName: string) {
	target.constructor[routerAction] = methodName;
}

/**
 * Method decorator. Mark a function to be called for cloning store
 */
export function beforeClone(target, methodName: string) {
	target.constructor[beforeCloneSymb] = methodName;
}

/**
 * Method decorator. Mark a function to be called for cloning store
 */
export function clone(target, methodName: string) {
	target.constructor[cloneSymb] = methodName;
}

/**
 * Method decorator. Mark a function to be called for cloning store
 */
export function afterClone(target, methodName: string) {
	target.constructor[afterCloneSymb] = methodName;
}

function defaultRouter(route, action) {
	route = Array.isArray(route) ? route : [route];
	let prefix = [...route];
	let prop = prefix.pop();
	let object = this;
	for (let key of prefix) {
		object = object[key];
	}
	object[prop] = reduce(object[prop], action);
}

/**
 * Class decorator. Build the reducer for the class.
 */
export function store(target) {
	let proto = target.prototype;
	let actions = {};

	for (let methodName in proto) {
		let propDesc = Object.getOwnPropertyDescriptor(proto, methodName);
		if (!(propDesc && propDesc.get) && proto[methodName] && proto[methodName][actionSave]) {
			actions[methodName] = proto[methodName][actionSave];
		}
	}

	const routeKey = "@route";
	if (target[routerAction]) {
		actions[target[routerAction]] = proto[target[routerAction]];
	} else {
		define(target, routerAction, routeKey)
		actions[routeKey] = defaultRouter;
	}

	target[reducer] = function reducer(state, action) {
		if (action && action.type && actions[action.type]) {
			let newState = cloneObject(state);
			actions[action.type].apply(newState, action.payload);
			return newState;
		} else {
			return state;
		}
	};
}

// ----------------------------------------------------------------------------
//                                FUNCTIONS
// ----------------------------------------------------------------------------
/**
 * Set ${parent} as the owner of ${store}, and set ${route} as the path of ${store} in ${parent}.
 * @param store store to mount
 * @param parent parent store, becoming owner of store
 * @param route route where store is mounted
 */
export function mount<Store>(store: Store, parent: any, route: any): Store {
	if (!isStore(store)) return store;
	let type = parent.constructor[routerAction] || "@route";
	const disp = (action: any) => parent[dispatch]({ type, payload: [route, action] });
	define(store, dispatch, disp);
	return store;
}


/**
 * Apply action to the store
 * @param store the store
 * @param action the action
 */
export function reduce(store, action) {
	assertHasReducer(store);
	return store.constructor[reducer](store, action);
}

/**
 * Bind action methods, and merge with props, for easy destructuring
 * @param obj store you want to destructure
 */
export function props(obj) {
	let val = { ...obj };
	let proto = obj.constructor.prototype;
	for (let i in proto) {
		if (proto[i][actionSave]) {
			val[i] = proto[i].bind(obj);
		}
	}
	return val;
}

function cloneObject<T extends Object>(orig: T): T {
	let constr = orig.constructor;
	if (constr[beforeCloneSymb]) {
		constr.prototype[constr[beforeCloneSymb]].apply(orig);
	}

	let copy;
	if (constr[cloneSymb]) {
		copy = constr.prototype[constr[cloneSymb]].apply(orig);
	} else {
		if (Array.isArray(orig)) {
			copy = [...orig];
			copy.constructor = orig.constructor;
		} else {
			copy = Object.assign(Object.create(Object.getPrototypeOf(orig)), orig)
		}
	}

	if (constr[afterCloneSymb]) {
		constr.prototype[constr[afterCloneSymb]].apply(copy);
	}

	define(copy, dispatch, orig[dispatch]);
	return copy;
}