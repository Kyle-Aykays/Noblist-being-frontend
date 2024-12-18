import { useState, useEffect } from "react";
import "../output.css";
import '../assets/css/login.css';
import Navbar from "../components/Navbar";
import PriorityTasks from "../components/PriorityTasks";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [checklist, setChecklist] = useState([]);
  const [error, setError] = useState("");
  const [checkedItems, setCheckedItems] = useState({});

  const checklistTypes = ["Morning", "LateMorning", "Afternoon", "Evening", "Night"];
  const fetchChecklist = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const responses = await Promise.all(
        checklistTypes.map((type) =>
          fetch(`${backendUrl}/checklist/getpriority`, {
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
          return [...acc, { checklistType: checklistTypes[index], items: result.data }];
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
      setError("An error occurred while fetching the checklist.");
      console.error(err);
    }
  };
  

  const handleCheckboxChange = (checklistType, item) => {
    const userId = localStorage.getItem("userId");
    const currentState = !!checkedItems[item._id];

    setCheckedItems((prevState) => ({
      ...prevState,
      [item._id]: !currentState,
    }));

    toggleCompletion(userId, checklistType, item._id, !currentState);
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
        throw new Error("Failed to update task completion status.");
      }

      fetchChecklist();
    } catch (err) {
      setError("Failed to update task completion.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, []);

  return (
    <>
      <Navbar />
      <div className="checklist-main">
        <h1 className="text-3xl font-bold mt-6 color-white ">Checklist</h1>
      <PriorityTasks backendUrl={backendUrl} fetchChecklist={fetchChecklist} 
      checklistTypes={checklistTypes}/> 
        {error && <p className="text-red-500 mt-4 ">{error}</p>}
        <ul className="mt-6">
          {checklist.length > 0 ? (
            checklist.map((checklistItem) => (
              <li key={checklistItem.checklistType} className="mb-4 p-4 border rounded-lg color-white">
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
                        onChange={() => handleCheckboxChange(checklistItem.checklistType, item)}
                        className="mr-2 mt-1 "
                      />
                      <div>
                        <label
                          htmlFor={item._id}
                          className={`font-medium padding-main ${checkedItems[item._id] ? "line-through" : ""}`}
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
