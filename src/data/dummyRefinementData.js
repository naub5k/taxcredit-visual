const dummyRefinementData = {
  stages: [
    { name: "전체 사업장", count: 4090000 },
    { name: "대분류 필터링 후", count: 2765695 },
    { name: "중분류 필터링 후", count: 2765695 },
    { name: "제외업종 제거 후", count: 1300000 }
  ],
  regions: {
    "서울특별시": ["강남구", "서초구", "송파구", "종로구", "중구", "마포구"],
    "경기도": ["고양시", "수원시", "성남시", "용인시", "화성시"],
    "부산광역시": ["해운대구", "동래구", "연제구", "부산진구"]
  }
};

export default dummyRefinementData;
