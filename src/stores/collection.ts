import { store, mount, route, reduce, action, afterClone } from "../index";

@store
class CollectionStore<T> {
	items: T[] = [];

	constructor(items: T[] = []) {
		this.items = [...items];
		this.items.forEach((item, i) => mount(item, this, i));
	}

	/**
	 * Return element at {index}
	 * @param index index of the element
	 */
	get(index: number) {
		return this.items[index];
	}

	@route
	private route(index: number, action) {
		this.items[index] = reduce(this.items[index], action);
	}

	@afterClone
	private afterClone() {
		this.items = [...this.items];
	}

	/**
	 * Action. Set the value of element at {index} to {item}
	 * @param index
	 * @param item 
	 */
	@action
	set(index: number, item: T) {
		this.items[index] = item;
		mount(item, this, index);
	}
	
	@action
	splice(index: number, number: number = 1) {
		this.items.splice(index, number);
		this.items.forEach((item, i) => mount(item, this, i));
	}

	/**
	 * Action. Add one or more elements to the end of the collection
	 * @param items one or more elements to add at the end of the collection
	 */
	@action
	push(...items: T[]) {
		let l = this.items.length;
		this.items.push(...items);
		for(let i = l; i < this.items.length; i++) {
			mount(this.items[i], this, i);
		}
	}

	/**
	 * Action. Alias for push
	 * @param items one or more elements to add at the end of the collection
	 */
	append(...items: T[]) {
		this.push(...items);
	}

	/**
	 * Action. Remove first element in the collection.
	 */
	@action
	shift() {
		this.items.shift();
		this.items.forEach((item, i) => mount(item, this, i));
	}
	
	@action
	unshift(...items: T[]) {
		this.items.unshift(...items);
		this.items.forEach((item, i) => mount(item, this, i));
	}

	prepend(...items: T[]) {
		this.unshift(...items);
	}

	map<R>(callbackFn: (value: T, index: number, array: T[]) => R, thisArg?: any) {
		return this.items.map(callbackFn, thisArg);
	}

	filter(callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any) {
		return this.items.filter(callbackfn, thisArg);
	}

	forEach(callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any) {
		return this.items.forEach(callbackfn, thisArg);
	}

	get length() {
		return this.items.length;
	}

	[Symbol.iterator]() { return this.items.values() }
}

export default CollectionStore;