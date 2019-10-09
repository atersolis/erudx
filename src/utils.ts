export const actionSave = Symbol("originalAction");
export const routerAction = Symbol("routerAction");
export const reducer = Symbol("reducer");
export const dispatch = Symbol("dispatch");
export const beforeCloneSymb = Symbol("beforeClone");
export const afterCloneSymb = Symbol("afterClone");
export const cloneSymb = Symbol("clone");
export const define = (obj, prop, val, writable = undefined) => {
	Object.defineProperty(obj, prop, { value: val, writable, configurable: true });
}
export const assertHasReducer = obj => {
	if (!obj.constructor[reducer]) {
		let className = obj.constructor[reducer];
		console.error("Error for object", obj);
		throw new Error(
			`Object of class ${className} has no reducer function ! \n` +
			`Did you forget to apply @store decorator on class ${className} ?`
		);
	}
};

export function isStore(obj) {
	return obj && obj.constructor && obj.constructor[reducer];
}