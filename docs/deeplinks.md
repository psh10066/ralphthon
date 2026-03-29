# 외부 딥링크 (API 승인 불필요)

취향 분석 결과를 외부 서비스로 연결할 때 사용. 키워드만 있으면 바로 링크 생성 가능.

## 네이버 쇼핑
```
https://search.shopping.naver.com/search/all?query={키워드}
```
예: `query=미니멀+텀블러`

## 카카오톡 선물하기
```
# 키워드 검색
https://gift.kakao.com/search/result?query={키워드}

# 카테고리 랭킹
https://gift.kakao.com/ranking/category/{categoryId}

# 개별 상품
https://gift.kakao.com/product/{productId}
```
카테고리 ID: 전체=11000, 뷰티=2, 식품=4, 리빙=5, 패션=1, 가전=7, 유아동=3, 레저=6, 명품=9, 주류=34, 반려동물=20

## 카카오톡 공유 (JS SDK)
```typescript
Kakao.Share.sendDefault({
  objectType: "commerce",
  content: {
    title: "취향 저격 선물",
    imageUrl: "이미지URL",
    link: { webUrl: "https://gift.kakao.com/search/result?query=키워드" },
  },
  commerce: { productName: "상품명", regularPrice: 29000 },
});
```
사전 준비: `Kakao.init('JavaScript 키')` — developers.kakao.com 에서 앱 생성 후 발급

## 활용 시나리오
AI가 취향 분석 → 키워드 생성 → 딥링크로 연결:
- "미니멀 + 자연 취향" → `query=미니멀+텀블러` → 네이버쇼핑/카카오선물하기
- 카카오톡 공유 버튼 → 친구에게 취향 맞춤 선물 추천
- Discord/Telegram → 취향 매칭 알림 발송
