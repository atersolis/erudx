import * as React from "preact";
import {store, action, Store, useStore} from './lib/store';

function sleep(ms) {
	return new Promise(res => setTimeout(res, ms));
}

@store
class CounterStore extends Store {
	readonly counter: number = 0;

	constructor(x) {
		super();
		this.counter = x;
	}

	/** Increment the counter */
	@action
	increment() {
		this.commit(new CounterStore(this.counter + 1));
	}

	/** Decrement the counter */
	@action
	decrement() {
		this.commit(new CounterStore(this.counter - 1));
	}
	
	/** Invert the counter */
	@action
	invert() {
		this.commit(new CounterStore(-this.counter));
	}

	/** Absolute value of the counter */
	abs() {
		return Math.abs(this.counter);
	}

	/**
	 * Increment the counter, sleep ${ms} millisecond and increment again
	 * @param ms 
	 */
	async incrementAfterDelay(ms) {
		this.increment();
		await sleep(ms);
		this.increment();
	}
}

const App = () => {
	let counter = useStore(CounterStore, 0);

	return (
		<div>
			<h1>My counter</h1>
			<button onClick={() => counter.incrementAfterDelay(1000)}>+ZzzzZz+</button>
			<button onClick={() => counter.increment()}>+</button>
			<button onClick={() => counter.decrement()}>-</button>
			<button onClick={() => counter.invert()}>*(-1)</button>
			<p>Counter {JSON.stringify(counter)}</p>
			<p>Counter {counter.counter}</p>
			<p>Abs counter {counter.abs()}</p>
		</div>
	);
};

export default App;
