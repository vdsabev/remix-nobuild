/** @typedef {import('./types').Board} Board */
/** @typedef {import('./types').Lane} Lane */
/** @typedef {import('./types').Task} Task */

export const actions = {
	// Only used for type checking
	/** @type {string} */ _id: "",
	/** @type {Lane[]} */ lanes: [],

	// Board
	set(/** @type {Partial<Board>} */ board) {
		Object.assign(this, board);
		return this;
	},

	// Lanes
	addLane() {
		this.lanes.push({ _id: crypto.randomUUID(), name: "New Lane", tasks: [] });
		return this;
	},

	removeLane(/** @type {Lane} */ lane) {
		const indexOfLane = this.lanes.indexOf(lane);
		if (indexOfLane !== -1) {
			this.lanes.splice(indexOfLane, 1);
		}
		return this;
	},

	updateLane(/** @type {Lane} */ lane, /** @type {string} */ name) {
		lane.name = name;
		return this;
	},

	moveLane(/** @type {Lane} */ lane, /** @type {number} */ toIndex) {
		const fromIndex = this.lanes.indexOf(lane);
		if (fromIndex < toIndex) {
			this.lanes.splice(fromIndex, 1);
			this.lanes.splice(toIndex - 1, 0, lane);
		} else if (fromIndex > toIndex) {
			this.lanes.splice(fromIndex, 1);
			this.lanes.splice(toIndex, 0, lane);
		}
		return this;
	},

	// Tasks
	addTask(/** @type {Lane} */ lane, /** @type {string} */ text) {
		if (text) {
			lane.tasks.push({ _id: crypto.randomUUID(), text });
		}
		return this;
	},

	updateTask(/** @type {Task} */ task, /** @type {string} */ text) {
		if (text) {
			task.text = text;
		} else {
			const lane = this.lanes.find((l) => l.tasks.includes(task));
			if (lane) {
				const indexOfTask = lane.tasks.indexOf(task);
				if (indexOfTask !== -1) {
					lane.tasks.splice(indexOfTask, 1);
				}
			}
		}
		return this;
	},

	moveTask(
		/** @type {Task} */ task,
		/** @type {number} */ toIndex,
		/** @type {Lane} */ toLane,
	) {
		const fromLane = this.lanes.find((lane) => lane.tasks.find(byId(task._id)));
		if (fromLane) {
			const fromIndex = fromLane.tasks.indexOf(task);
			if (fromIndex !== -1) {
				if (fromIndex < toIndex && fromLane === toLane) {
					fromLane.tasks.splice(fromIndex, 1);
					toLane.tasks.splice(toIndex - 1, 0, task);
				} else if (fromIndex > toIndex || fromLane !== toLane) {
					fromLane.tasks.splice(fromIndex, 1);
					toLane.tasks.splice(toIndex, 0, task);
				}
			}
		}
		return this;
	},
};

// Utils
const byId = (/** @type {any} */ id) => (/** @type {{ _id: any }} */ object) =>
	object._id === id;
