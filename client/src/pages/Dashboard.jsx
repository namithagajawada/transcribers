import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/tasks");
    setTasks(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Tasks</h1>

      {tasks.map((task) => (
        <div
            key={task._id}
            className="p-4 mb-4 rounded-lg shadow bg-white border"
            >
            <p className="text-gray-700">
                <strong>Description:</strong> {task.description}
            </p>

            <p className={`mt-2 font-semibold ${
                task.status === "assigned"
                ? "text-green-600"
                : "text-yellow-600"
            }`}>
                Status: {task.status}
            </p>

            <p className="mt-1 text-blue-600">
                <strong>Assigned To:</strong>{" "}
                {task.assignedTo ? task.assignedTo.name : "Not Assigned"}
            </p>
        </div>
      ))}
    </div>
  );
}