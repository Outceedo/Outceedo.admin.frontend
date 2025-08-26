import { useState } from "react";
import { Trash2, Eye, Pencil, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
type Review = {
  id: number;
  user: string;
  comment: string;
};

const reviewData: Review[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  user: "User name",
  comment: "This needs improvement",
}));

const Reviews = () => {
  const [selected, setSelected] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
   const navigate = useNavigate();
  const pageSize = 10;
  const totalPages = Math.ceil(reviewData.length / pageSize);
  const paginated = reviewData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentPageIds = paginated.map((r) => r.id);
    const allSelected = currentPageIds.every((id) => selected.includes(id));
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  return (
    <div className="p-8 sm:p-6 w-full mx-auto bg-white rounded-xl shadow-md dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <button
          onClick={() => navigate(-1)}
            className="text-gray-500 text-lg font-bold dark:text-red-600"
        >
          ✕
        </button>
      </div>

      
          <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700 overflow-auto ">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-100 dark:bg-blue-900 text-xl text-left text-gray-700 font-semibold dark:text-white">
              <th className="p-3">
               
              </th>
              <th className="p-3">Reviews</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((review) => (
              <tr
                key={review.id}
                className="border-t transition-colors"
              >
                <td className="p-3">
                  <Checkbox
                    checked={selected.includes(review.id)}
                    onCheckedChange={() => toggleSelect(review.id)}
                  />
                </td>
                <td className="p-3">
                  <span className="font-medium">
                    {review.user} reviewed the post:
                  </span>{" "}
                  <span className="text-gray-500 dark:text-white">
                    &quot;{review.comment}&quot;
                  </span>
                </td>
                <td className="p-3 flex gap-2 justify-end">
                  <Button size="icon" variant="ghost">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
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
          {Math.min(currentPage * pageSize, reviewData.length)} of{" "}
          {reviewData.length}
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

export default Reviews;
