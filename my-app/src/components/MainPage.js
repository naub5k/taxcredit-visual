import React from "react";
import { employmentRegionData } from "../data/employmentRegionData";
import RegionSelector from "./RegionSelector";

const MainPage = () => {
  // 시도별 총합 계산
  const getTotalBySido = (sidoName) => {
    const region = employmentRegionData.find((r) => r.시도 === sidoName);
    if (!region) return 0;
    return region.구군목록.reduce((sum, g) => sum + g.업체수, 0);
  };

  const totalSeoul = getTotalBySido("서울특별시");
  const totalGyeonggi = getTotalBySido("경기도");

  // 기타 지역 합산
  const totalOther = employmentRegionData
    .filter((r) => r.시도 !== "서울특별시" && r.시도 !== "경기도")
    .reduce((sum, r) => sum + r.구군목록.reduce((s, g) => s + g.업체수, 0), 0);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>고용이력부</h1>
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        <div>서울: {totalSeoul.toLocaleString()}개</div>
        <div>경기: {totalGyeonggi.toLocaleString()}개</div>
        <div>기타지역: {totalOther.toLocaleString()}개</div>
      </div>
      <RegionSelector />
    </div>
  );
};

export default MainPage;