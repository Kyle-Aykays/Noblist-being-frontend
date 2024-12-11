import { useState, useEffect } from "react";
import "../output.css";
import '../assets/css/home.css'

import Navbar from "../components/Navbar";

const Home = () => {
  const [checklist, setChecklist] = useState([]);
  const [error, setError] = useState("");
  const [checkedItems, setCheckedItems] = useState({}); // To track checkbox state

  // Fetch checklist data from the backend
  
  const fetchChecklist = async () => {
    const userId = localStorage.getItem("userId"); // Get userId from localStorage
    const checklistTypes = ["Morning", "LateMorning", "Afternoon", "Evening", "Night"]; // Checklist types
  
    try {
      // Fetch data for all checklist types simultaneously
      const responses = await Promise.all(
        checklistTypes.map((type) =>
          fetch("http://localhost:8080/checklist/get", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, checklistType: type }),
          })
        )
      );
  
      // Parse all responses
      const results = await Promise.all(responses.map((response) => response.json()));
  
      // Check if all responses are OK and combine the data
      const combinedData = results.reduce((acc, result, index) => {
        if (responses[index].ok) {
          return [...acc, ...result.data]; // Append data
        } else {
          console.error(`Error fetching ${checklistTypes[index]} checklist:`, result.message);
          return acc;
        }
      }, []);
  
      setChecklist(combinedData);

      // Populate the `checkedItems` state based on `completed` field
      const updatedCheckedItems = {};
      combinedData.forEach((checklistItem) => {
        checklistItem.items.forEach((item) => {
          updatedCheckedItems[item._id] = item.completed; // Use the `completed` field
        });
      });
      setCheckedItems(updatedCheckedItems); // Update the `checkedItems` state
    } catch (err) {
      setError("An error occurred while fetching the checklist.");
      console.error(err);
    }
  };

   // Update task completion status in the database
   const toggleCompletion = async (userId, checklistType, taskId, isCompleted) => {
    try {
      const response = await fetch(`http://localhost:8080/checklist/toggle-completion`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, checklistType, taskId, isCompleted }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task completion status.");
      }

      fetchChecklist(); // Refresh checklist after update
    } catch (err) {
      console.error("Error updating completion status:", err);
      setError("Failed to update task completion.");
    }
  };
  
   // Handle checkbox change
   const handleCheckboxChange = (checklistType, item) => {
    const userId = localStorage.getItem("userId"); // Get userId from localStorage

    if (!item || !item._id) {
      console.error("Invalid task item:", item);
      return;
    }

    const currentState = !!checkedItems[item._id]; // Current checkbox state

    setCheckedItems((prevState) => ({
      ...prevState,
      [item._id]: !currentState, // Toggle the checkbox state
    }));

    // Call API to update the database
    toggleCompletion(userId, checklistType, item._id, !currentState);
  };

  useEffect(() => {
    fetchChecklist();
  }, []);

  

  return (
    <>
      <Navbar />
      <div className="checklist-main">
        <h1 className="text-3xl font-bold underline mt-6">Checklist</h1>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* Render Checklist */}
        <ul className="mt-6">
          {checklist.length > 0 ? (
            checklist.map((checklistItem) => (
              <li key={checklistItem._id} className="mb-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{checklistItem.checklistType}</h3>
                <ul>
                  {checklistItem.items.map((item) => (
                    <li
                      key={item._id}
                      className={`flex items-start mb-2 p-2 rounded ${
                        checkedItems[item._id] ? "bg-green-100 text-green-800" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={item._id}
                        checked={!!checkedItems[item._id]}
                        onChange={() =>
                          handleCheckboxChange(checklistItem.checklistType, item)
                        }
                        className="mr-2 mt-1"
                      />
                      <div>
                        <label
                          htmlFor={item._id}
                          className={`font-medium ${
                            checkedItems[item._id] ? "line-through" : ""
                          }`}
                        >
                          {item.name}
                        </label>
                        {item.note && (
                          <p className="text-sm text-gray-600 pl-6">{item.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))
          ) : (
            <p className="text-gray-500 mt-4">No checklist items available.</p>
          )}
        </ul>
      </div>
    </>
  );
};

export default Home;
