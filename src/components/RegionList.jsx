import React, { useState } from "react";

const RegionList = ({ regions }) => {
  const [expandedRegion, setExpandedRegion] = useState(null);

  const toggleRegion = (region) => {
    setExpandedRegion(expandedRegion === region ? null : region);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">지역별 분류 목록</h2>
      <div className="space-y-2">
        {Object.keys(regions).map((region) => (
          <div key={region} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleRegion(region)}
              className="flex items-center justify-between w-full p-4 text-left font-medium bg-gray-50 hover:bg-gray-100"
            >
              <span>{region}</span>
              <svg className={`w-5 h-5 transition-transform ${expandedRegion === region ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedRegion === region && (
              <ul className="p-4 bg-white divide-y">
                {regions[region].map((subRegion) => (
                  <li key={subRegion} className="py-2">{subRegion}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionList; 