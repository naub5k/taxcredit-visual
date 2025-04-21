import React from "react";
import FunnelChart from "./components/FunnelChart";
import RegionList from "./components/RegionList";
import dummyRefinementData from "./data/dummyRefinementData";
import "./index.css";

function App() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-center">DB 필터링 과정 시각화</h1>
      <FunnelChart data={dummyRefinementData.stages} />
      <RegionList regions={dummyRefinementData.regions} />
    </div>
  );
}

export default App; 