import React, { useEffect, useState } from "react";

const RegionDetailPage = ({ sido, gugun }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:7071"
          : "";

      try {
        const response = await fetch(
          `${baseUrl}/api/getSampleList?sido=${encodeURIComponent(
            sido
          )}&gugun=${encodeURIComponent(gugun)}`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              Accept: "application/json",
            },
          }
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

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>{`${sido} ${gugun} 상세 데이터`}</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
};

export default RegionDetailPage;
