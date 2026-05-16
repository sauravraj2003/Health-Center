import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const Queries = () => {
  const { aToken, queries, getAllQueries } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllQueries();
    }
  }, [aToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">Patient Queries</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll min-h-[50vh] p-4">
        {queries && queries.length > 0 ? (
          <div className="flex flex-col gap-4">
            {queries.map((item, index) => (
              <div
                key={index}
                className="border p-4 rounded bg-gray-50 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-semibold text-lg text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-gray-500 text-sm">{item.email}</p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>
                <div className="pt-2">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No queries received yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Queries;
