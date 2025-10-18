import { describe, expect, test } from "bun:test";
import { actions } from "./actions.js";

function getData() {
	return {
		empty: { lanes: [] },
		withLanes: {
			lanes: [
				{ _id: "1", name: "A", tasks: [] },
				{ _id: "2", name: "B", tasks: [] },
				{ _id: "3", name: "C", tasks: [] },
			],
		},
		withTasks: {
			lanes: [
				{
					_id: "1",
					name: "A",
					tasks: [
						{ _id: "1", text: "Task A1" },
						{ _id: "2", text: "Task A2" },
						{ _id: "3", text: "Task A3" },
					],
				},
				{
					_id: "2",
					name: "B",
					tasks: [
						{ _id: "4", text: "Task B1" },
						{ _id: "5", text: "Task B2" },
					],
				},
				{
					_id: "3",
					name: "C",
					tasks: [{ _id: "6", text: "Task C1" }],
				},
			],
		},
	};
}

// Lanes
describe("addLane", () => {
	test("should add new lane", () => {
		expect(actions.addLane.call(getData().empty)).toEqual({
			lanes: [{ _id: expect.any(String), name: "New Lane", tasks: [] }],
		});
	});
});

describe("removeLane", () => {
	test("should remove existing lane", () => {
		const data = getData();
		expect(
			actions.removeLane.call(data.withLanes, data.withLanes.lanes[0]),
		).toEqual({ lanes: getData().withLanes.lanes.slice(1) });
	});

	test("should not remove non-existing lane", () => {
		expect(actions.removeLane.call(getData().withLanes, {})).toEqual(
			getData().withLanes,
		);
	});
});

describe("updateLane", () => {
	test("should update existing lane name", () => {
		const data = getData();
		expect(
			actions.updateLane.call(data.withLanes, data.withLanes.lanes[0], "D"),
		).toEqual({
			lanes: [
				{ _id: "1", name: "D", tasks: [] },
				...getData().withLanes.lanes.slice(1),
			],
		});
	});

	test("should not update non-existing lane", () => {
		expect(
			actions.updateLane.call(
				getData().withLanes,
				{ name: "D", tasks: [] },
				"D",
			),
		).toEqual(getData().withLanes);
	});
});

describe("moveLane", () => {
	test("should not move lane before itself", () => {
		const data = getData();
		expect(
			actions.moveLane.call(data.withLanes, data.withLanes.lanes[0], 0),
		).toEqual(getData().withLanes);
	});

	test("should not move lane after itself", () => {
		const data = getData();
		expect(
			actions.moveLane.call(data.withLanes, data.withLanes.lanes[0], 1),
		).toEqual(getData().withLanes);
	});

	test("should move first lane to the end", () => {
		const data = getData();
		const expected = getData();
		expect(
			actions.moveLane.call(data.withLanes, data.withLanes.lanes[0], 1000),
		).toEqual({
			lanes: [
				expected.withLanes.lanes[1],
				expected.withLanes.lanes[2],
				expected.withLanes.lanes[0],
			],
		});
	});

	test("should not move last lane after the end", () => {
		const data = getData();
		const expected = getData();
		expect(
			actions.moveLane.call(data.withLanes, data.withLanes.lanes.at(-1), 1000),
		).toEqual({
			lanes: [
				expected.withLanes.lanes[0],
				expected.withLanes.lanes[1],
				expected.withLanes.lanes[2],
			],
		});
	});
});

// Tasks
describe("addTask", () => {
	test("should add new task when text is provided", () => {
		const data = getData();
		expect(
			actions.addTask.call(data.withLanes, data.withLanes.lanes[0], "Task A1"),
		).toEqual({
			lanes: [
				{
					_id: "1",
					name: "A",
					tasks: [{ _id: expect.any(String), text: "Task A1" }],
				},
				...getData().withLanes.lanes.slice(1),
			],
		});
	});

	test("should not change tasks when text is not provided", () => {
		const data = getData();
		expect(
			actions.addTask.call(data.withLanes, data.withLanes.lanes[0], ""),
		).toEqual(getData().withLanes);
	});

	test("should not change tasks for non-existent lane", () => {
		expect(
			actions.addTask.call(getData().withLanes, { tasks: [] }, "Task A1"),
		).toEqual(getData().withLanes);
	});
});

describe("updateTask", () => {
	test("should update existing task when text is provided", () => {
		const data = getData();
		const expected = getData();
		expect(
			actions.updateTask.call(
				data.withTasks,
				data.withTasks.lanes[0].tasks[0],
				"Task A1 - edited",
			),
		).toEqual({
			lanes: [
				{
					_id: "1",
					name: "A",
					tasks: [
						{ _id: "1", text: "Task A1 - edited" },
						...expected.withTasks.lanes[0].tasks.slice(1),
					],
				},
				...expected.withTasks.lanes.slice(1),
			],
		});
	});

	test("should remove existing task when text is not provided", () => {
		const data = getData();
		const expected = getData();
		expect(
			actions.updateTask.call(
				data.withTasks,
				data.withTasks.lanes[0].tasks[0],
				"",
			),
		).toEqual({
			lanes: [
				{
					_id: "1",
					name: "A",
					tasks: expected.withTasks.lanes[0].tasks.slice(1),
				},
				...expected.withTasks.lanes.slice(1),
			],
		});
	});

	test("should not update non-existing task", () => {
		expect(
			actions.updateTask.call(
				getData().withTasks,
				{ text: "Task D1" },
				"Task D1 - edited",
			),
		).toEqual(getData().withTasks);
	});
});

describe("moveTask", () => {
	test("should not move task before itself", () => {
		const data = getData();
		expect(
			actions.moveTask.call(
				data.withTasks,
				data.withTasks.lanes[0].tasks[0],
				0,
				data.withTasks.lanes[0],
			),
		).toEqual(getData().withTasks);
	});

	test("should not move task after itself", () => {
		const data = getData();
		expect(
			actions.moveTask.call(
				data.withTasks,
				data.withTasks.lanes[0].tasks[0],
				1,
				data.withTasks.lanes[0],
			),
		).toEqual(getData().withTasks);
	});

	test("should move first task to the end of the lane", () => {
		const data = getData();
		const expected = getData();
		expect(
			actions.moveTask.call(
				data.withTasks,
				data.withTasks.lanes[0].tasks[0],
				1000,
				data.withTasks.lanes[0],
			),
		).toEqual({
			lanes: [
				{
					...expected.withTasks.lanes[0],
					tasks: [
						...expected.withTasks.lanes[0].tasks.slice(1),
						expected.withTasks.lanes[0].tasks[0],
					],
				},
				...expected.withTasks.lanes.slice(1),
			],
		});
	});

	test("should not move last task after the end", () => {
		const data = getData();
		expect(
			actions.moveTask.call(
				data.withTasks,
				data.withTasks.lanes[0].tasks.at(-1),
				1000,
				data.withTasks.lanes[0],
			),
		).toEqual(getData().withTasks);
	});

	test("should move task to another lane", () => {
		const data = getData();
		const expected = getData();
		expect(
			actions.moveTask.call(
				data.withTasks,
				data.withTasks.lanes[0].tasks[0],
				0,
				data.withTasks.lanes[1],
			),
		).toEqual({
			lanes: [
				{
					...expected.withTasks.lanes[0],
					tasks: expected.withTasks.lanes[0].tasks.slice(1),
				},
				{
					...expected.withTasks.lanes[1],
					tasks: [
						expected.withTasks.lanes[0].tasks[0],
						...expected.withTasks.lanes[1].tasks,
					],
				},
				expected.withTasks.lanes[2],
			],
		});
	});
});
