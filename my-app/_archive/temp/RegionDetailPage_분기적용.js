
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function RegionDetailPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sido = queryParams.get("sido");
  const gugun = queryParams.get("gugun");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!sido || !gugun) {
        setError("시도 또는 구군 정보가 누락되었습니다.");
        setLoading(false);
        return;
      }

      try {
        const baseUrl =
          process.env.NODE_ENV === "development"
            ? "http://localhost:7071"
            : "";
        const response = await fetch(
          `${baseUrl}/api/getSampleList?sido=${encodeURIComponent(
            sido
          )}&gugun=${encodeURIComponent(gugun)}`
        );

        if (!response.ok) {
          throw new Error(`서버 응답 실패: ${response.status}`);
        }

        const responseData = await response.json();
        setData(responseData);
        setLoading(false);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류 발생:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    fetchData();
  }, [sido, gugun]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>상세 지역 정보</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.사업장이름}</li>
        ))}
      </ul>
    </div>
  );
}

export default RegionDetailPage;
