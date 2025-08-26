import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox"; // Update path if needed

type Interest = {
  id: number;
  follows: string;
  followers: string;
};

const interestsData: Interest[] = [
  { id: 1, follows: "Player A", followers: "89.3k followers" },
  { id: 2, follows: "Player B", followers: "89.3k followers" },
  { id: 3, follows: "Player C", followers: "89.3k followers" },
  { id: 4, follows: "Player D", followers: "89.3k followers" },
  { id: 5, follows: "Player E", followers: "89.3k followers" },
  { id: 6, follows: "Team A", followers: "89.3k followers" },
  { id: 7, follows: "Player F", followers: "89.3k followers" },
  { id: 8, follows: "Player G", followers: "89.3k followers" },
  { id: 9, follows: "Team B", followers: "89.3k followers" },
  { id: 10, follows: "Team C", followers: "89.3k followers" },
];

const Interests = () => {
  const [selected, setSelected] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
     const navigate = useNavigate();
    const pageSize = 10;
    const totalPages = Math.ceil(interestsData.length / pageSize);
    const paginated = interestsData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === interestsData.length) {
      setSelected([]);
    } else {
      setSelected(interestsData.map((item) => item.id));
    }
  };

  return (
    <div className="p-10 sm:p-8 w-full mx-auto bg-white rounded-xl shadow-md dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Interests</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 text-lg font-bold dark:text-red-600"
        >
          ✕
        </button>
      </div>

      
          <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-100 dark:bg-blue-900 text-xl text-left text-gray-700 font-semibold dark:text-white ">
              <th className="p-3">
               
              </th>
              <th className="p-3">Interests</th>
              <th className="p-3 text-right">Following</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item) => (
              <tr
                key={item.id}
                className="border-t  transition-colors"
              >
                <td className="p-3">
                  <Checkbox
                    checked={selected.includes(item.id)}
                    onCheckedChange={() => toggleSelect(item.id)}
                  />
                </td>
                <td className="p-3">
                  <span className="font-medium text-gray-800 dark:text-white">
                    User name follows:
                  </span>{" "}
                  <span className="text-gray-600 dark:text-white">{item.follows}</span>
                </td>
                <td className="p-3 text-right text-gray-600 dark:text-white">
                  {item.followers}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500">
        <div className="text-center sm:text-left w-full sm:w-auto">
          Showing{" "}
          {(currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, interestsData.length)} of{" "}
          {interestsData.length}
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          <button
            className="border px-2 py-1 rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ⟨
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`border px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-gray-300 font-semibold" : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="border px-2 py-1 rounded"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            ⟩
          </button>
        </div>
      </div>
    </div>
  );
};

export default Interests;
