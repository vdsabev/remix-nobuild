export const createJSONStorage = ({ key, defaultValue }) => {
	let value = null;

	return {
		get() {
			if (!value) {
				const storedValue = localStorage.getItem(key);

				try {
					value = storedValue ? JSON.parse(storedValue) : defaultValue;
				} catch (error) {
					// Ignore for now, this is expected to happen now and then
					value = defaultValue;
				}
			}

			return value;
		},
		set(newValue) {
			value = newValue;
			localStorage.setItem(key, JSON.stringify(value));
		},
	};
};
