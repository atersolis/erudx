import { store, mount, route, reduce } from "../index";

@store
class RecordStore<TProps> {
	constructor(struct: TProps) {
		for (let name in struct) {
			(this as any)[name] = mount(struct[name], this, name);
		}
	}

	@route
	route(name: string, action) {
		(this as any)[name] = reduce((this as any)[name], action);
	}
}

function record<TProps>(props: TProps) {
	return new RecordStore(props) as unknown as TProps & RecordStore<TProps>;
}

export default record;