// import { useState, useRef } from "react";
// import axios from "axios";

// const SpeechRecognition =
//   window.SpeechRecognition || window.webkitSpeechRecognition;

// export default function VoiceInput() {
//   const [text, setText] = useState("");
//   const [matches, setMatches] = useState([]);
//   const [taskId, setTaskId] = useState(null);
//   const recognitionRef = useRef(null);

//   // Initialize speech recognition once
//   if (!recognitionRef.current) {
//     const recognition = new SpeechRecognition();

//     recognition.continuous = true;
//     recognition.lang = "en-US";
//     recognition.interimResults = false;

//     recognition.onresult = (event) => {
//       let finalTranscript = "";

//       for (let i = 0; i < event.results.length; i++) {
//         if (event.results[i].isFinal) {
//           finalTranscript += event.results[i][0].transcript + " ";
//         }
//       }

//       if (finalTranscript) {
//         setText((prev) => prev + finalTranscript);
//       }
//     };

//     recognition.onerror = (event) => {
//       console.error("Speech error:", event.error);
//     };

//     recognitionRef.current = recognition;
//   }

//   const startListening = () => {
//     setText("");
//     recognitionRef.current.start();
//   };

//   const stopListening = () => {
//     recognitionRef.current.stop();
//   };

//   // 🔥 CREATE TASK + MATCH
//   const submitTask = async () => {
//     console.log("Submit clicked");

//     try {
//       // 1️⃣ Create task
//       const res = await axios.post("http://localhost:5000/create-task", {
//         description: text,
//         type: "transcription",
//         language: "English",
//       });

//       setTaskId(res.data._id); // ✅ store task id
//       console.log("Task created:", res.data);

//       // 2️⃣ Get matches
//       const matchRes = await axios.post("http://localhost:5000/match", {
//         language: "English",
//         type: "transcription",
//       });

//       console.log("Matches:", matchRes.data);

//       setMatches(matchRes.data);
//       setText("");
//     } catch (error) {
//       console.error(error);
//       alert("Error creating task");
//     }
//   };

//   // 🔥 ASSIGN ASSISTANT
//   const assignAssistant = async (assistantId) => {
//     try {
//       const res = await axios.post("http://localhost:5000/assign-task", {
//         taskId,
//         assistantId,
//       });

//       console.log("Assigned:", res.data);
//       alert("✅ Assistant assigned successfully!");
//     } catch (error) {
//       console.error(error);
//       alert("❌ Assignment failed");
//     }
//   };

//   return (
//     <div className="p-4 max-w-xl mx-auto">
//       {/* INPUT */}
//       <textarea
//         className="w-full p-3 border rounded"
//         placeholder="Type or speak your request..."
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//       />

//       {/* BUTTONS */}
//       <div className="flex gap-3 mt-3">
//         <button
//           onClick={startListening}
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           🎤 Speak
//         </button>

//         <button
//           onClick={stopListening}
//           className="bg-red-500 text-white px-4 py-2 rounded"
//         >
//           ⏹ Stop
//         </button>

//         <button
//           onClick={submitTask}
//           className="bg-green-500 text-white px-4 py-2 rounded"
//         >
//           Submit
//         </button>
//       </div>

//       {/* MATCHED ASSISTANTS */}
//       {matches.length > 0 && (
//         <div className="mt-6">
//           <h2 className="text-xl font-bold mb-3">
//             Matched Assistants
//           </h2>

//           {matches.map((a, index) => (
//             <div
//               key={index}
//               className="p-3 mb-2 border rounded bg-gray-50"
//             >
//               <p><strong>Name:</strong> {a.name}</p>
//               <p><strong>Rating:</strong> {a.rating}</p>
//               <p><strong>Skills:</strong> {a.skills?.join(", ")}</p>
//               <p><strong>Score:</strong> {a.score.toFixed(2)}</p>

//               {/* 🔥 SELECT BUTTON */}
//               <button
//                 onClick={() => assignAssistant(a._id)}
//                 className="mt-2 bg-purple-500 text-white px-3 py-1 rounded"
//               >
//                 Select
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useRef } from "react";
import axios from "axios";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceInput() {
  const [text, setText] = useState("");
  const [matches, setMatches] = useState([]);
  const [taskId, setTaskId] = useState(null);
  const [assignedAssistant, setAssignedAssistant] = useState(null); // 🔥 NEW
  const recognitionRef = useRef(null);

  // Initialize speech recognition once
  if (!recognitionRef.current) {
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }

      if (finalTranscript) {
        setText((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
    };

    recognitionRef.current = recognition;
  }

  const startListening = () => {
    setText("");
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current.stop();
  };

  // 🔥 CREATE TASK + MATCH
  const submitTask = async () => {
    try {
      // 1️⃣ Create task
      const res = await axios.post("http://localhost:5000/create-task", {
        description: text,
        type: "transcription",
        language: "English",
      });

      setTaskId(res.data._id);
      console.log("Task created:", res.data);

      // 2️⃣ Get matches
      const matchRes = await axios.post("http://localhost:5000/match", {
        language: "English",
        type: "transcription",
      });

      console.log("Matches:", matchRes.data);

      setMatches(matchRes.data);
      setAssignedAssistant(null); // reset previous assignment
      setText("");
    } catch (error) {
      console.error(error);
      alert("Error creating task");
    }
  };

  // 🔥 ASSIGN ASSISTANT
  const assignAssistant = async (assistantId, assistantName) => {
    try {
      const res = await axios.post("http://localhost:5000/assign-task", {
        taskId,
        assistantId,
      });

      console.log("Assigned:", res.data);

      setAssignedAssistant(assistantName); // ✅ show in UI
      alert("✅ Assistant assigned successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Assignment failed");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      {/* INPUT */}
      <textarea
        className="w-full p-3 border rounded"
        placeholder="Type or speak your request..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* BUTTONS */}
      <div className="flex gap-3 mt-3">
        <button
          onClick={startListening}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          🎤 Speak
        </button>

        <button
          onClick={stopListening}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          ⏹ Stop
        </button>

        <button
          onClick={submitTask}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>

      {/* MATCHED ASSISTANTS */}
      {matches.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-3">
            Matched Assistants
          </h2>

          {matches.map((a, index) => (
            <div
              key={index}
              className="p-3 mb-2 border rounded bg-gray-50"
            >
              <p><strong>Name:</strong> {a.name}</p>
              <p><strong>Rating:</strong> {a.rating}</p>
              <p><strong>Skills:</strong> {a.skills?.join(", ")}</p>
              <p><strong>Score:</strong> {a.score.toFixed(2)}</p>

              <button
                onClick={() => assignAssistant(a._id, a.name)}
                className="mt-2 bg-purple-500 text-white px-3 py-1 rounded"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 SHOW ASSIGNED RESULT */}
      {assignedAssistant && (
        <div className="mt-6 p-4 bg-green-100 border rounded">
          <h3 className="text-lg font-bold">
            ✅ Assigned to: {assignedAssistant}
          </h3>
        </div>
      )}
    </div>
  );
}