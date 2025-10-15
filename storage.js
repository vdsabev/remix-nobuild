export const createReactiveProxy = (obj, onChange) => {
	if (typeof obj !== "object" || obj === null) return obj;
	const mutatingMethods = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin']);
	if (Array.isArray(obj)) {
		return new Proxy(obj, {
			set(target, prop, value) {
				target[prop] = createReactiveProxy(value, onChange);
				onChange();
				return true;
			},
			get(target, prop) {
				if (typeof target[prop] === "function") {
					if (mutatingMethods.has(prop)) {
						return (...args) => {
							const result = target[prop](...args);
							onChange();
							return result;
						};
					} else {
						return target[prop];
					}
				}
				const val = target[prop];
				if (typeof val === "object" && val !== null) {
					return createReactiveProxy(val, onChange);
				}
				return val;
			},
		});
	} else {
		return new Proxy(obj, {
			set(target, prop, value) {
				target[prop] = createReactiveProxy(value, onChange);
				onChange();
				return true;
			},
			get(target, prop) {
				const val = target[prop];
				if (typeof val === "object" && val !== null) {
					return createReactiveProxy(val, onChange);
				}
				return val;
			},
		});
	}
};

export const createJSONStorage = ({ key, defaultValue }) => {
	let value = null;

	const save = () => {
		localStorage.setItem(key, JSON.stringify(value));
	};

	return {
		get() {
			if (!value) {
				const storedValue = localStorage.getItem(key);
				try {
					value = storedValue ? JSON.parse(storedValue) : defaultValue;
					value = createReactiveProxy(value, save);
				} catch (error) {
					value = createReactiveProxy(defaultValue, save);
				}
			}
			return value;
		},
		set(newValue) {
			value = createReactiveProxy(newValue, save);
			save();
		},
	};
};
