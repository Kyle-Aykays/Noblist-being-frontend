import React, { useState, useEffect } from "react";
import "../assets/css/login.css";
import "../assets/css/priorities.css";

const HighPriorityTasks = ({ backendUrl, userId }) => {
  const [checklist, setChecklist] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", note: "", checklistType: "Morning" });

  const checklistTypes = ["Morning", "LateMorning", "Afternoon", "Evening", "Night"];

  const fetchHighPriorityTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const responses = await Promise.all(
        checklistTypes.map((type) =>
          fetch(`${backendUrl}/checklist/gethighpriority`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, checklistType: type }),
          })
        )
      );

      const results = await Promise.all(responses.map((response) => response.json()));

      const combinedData = results.reduce((acc, result, index) => {
        if (responses[index].ok && result.success) {
          return [
            ...acc,
            { checklistType: checklistTypes[index], items: result.data },
          ];
        } else {
          console.error(`Error fetching ${checklistTypes[index]} checklist:`, result.message);
          return acc;
        }
      }, []);

      setChecklist(combinedData);

      const updatedCheckedItems = {};
      combinedData.forEach((checklistItem) => {
        checklistItem.items.forEach((item) => {
          updatedCheckedItems[item._id] = item.completed;
        });
      });
      setCheckedItems(updatedCheckedItems);
    } catch (err) {
      setError("An error occurred while fetching high-priority tasks.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    try {
      const response = await fetch(`${backendUrl}/checklist/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          checklistType: newTask.checklistType,
          customItems: [
            { name: newTask.name, note: newTask.note, completed: false, priority: "high" },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create the task.");
      }

      setNewTask({ name: "", note: "", checklistType: "Morning" });
      setShowAddTaskForm(false);
      fetchHighPriorityTasks();
    } catch (err) {
      setError("Failed to create the task.");
      console.error(err);
    }
  };

  const handleCheckboxChange = (task, checklistType) => {
    const currentState = !!checkedItems[task._id];
    setCheckedItems((prevState) => ({
      ...prevState,
      [task._id]: !currentState,
    }));
    toggleCompletion(userId, checklistType, task._id, !currentState);
  };

  const toggleCompletion = async (userId, checklistType, taskId, isCompleted) => {
    try {
      const response = await fetch(`${backendUrl}/checklist/toggle-completion`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, checklistType, taskId, isCompleted }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task completion.");
      }

      fetchHighPriorityTasks();
    } catch (err) {
      setError("Failed to update task completion.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHighPriorityTasks();
  }, [userId]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-red-500">High Priority Tasks</h3>
        <button
          onClick={() => setShowAddTaskForm(!showAddTaskForm)}
          className="text-xl bg-green-500 text-white px-2 py-1 rounded-full"
        >
          +
        </button>
      </div>

      {showAddTaskForm && (
        <div className="mt-4 p-4 border rounded custom-bg-color">
          <h4 className="font-semibold mb-2">Add New Task</h4>
          <div className="mb-2">
            <label className="block text-sm">Task Name</label>
            <input
              type="text"
              value={newTask.name}
              placeholder="Enter The Task Name"
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Note</label>
            <input
              type="text"
              value={newTask.note}
              placeholder="Enter The Task Note"
              onChange={(e) => setNewTask({ ...newTask, note: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Checklist Type</label>
            <select
              value={newTask.checklistType}
              onChange={(e) => setNewTask({ ...newTask, checklistType: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {checklistTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={createTask}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Task
          </button>
        </div>
      )}

      {loading && <p className="text-blue-500">Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="mt-4 color-white">
        {checklist.length > 0 ? (
          checklist.map((checklistItem) => (
            <div key={checklistItem.checklistType} className="mb-6 checklist-group">
              <h4 className="font-bold text-lg text-white mb-2">
                {checklistItem.checklistType} Tasks
              </h4>
              <ul>
                {checklistItem.items.map((task) => (
                  <li
                    key={task._id}
                    className={`flex items-center mb-2 p-2 rounded ${
                      checkedItems[task._id] ? "task-completed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={task._id}
                      checked={!!checkedItems[task._id]}
                      onChange={() => handleCheckboxChange(task, checklistItem.checklistType)}
                      className="mr-2 mt-1"
                    />
                    <div>
                      <label
                        htmlFor={task._id}
                        className={`font-medium ${
                          checkedItems[task._id] ? "line-through" : ""
                        }`}
                      >
                        {task.name}
                      </label>
                      {task.note && (
                        <p className="text-sm text-gray-600 pl-6">{task.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No high-priority tasks available.</p>
        )}
      </div>
    </div>
  );
};

export default HighPriorityTasks;
